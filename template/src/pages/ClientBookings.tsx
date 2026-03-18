import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { useSlots } from '@/hooks/useSlots';
import { supabase } from '@/integrations/supabase/client';
import { TimePickerWeekGrid } from '@/components/blocks/booking/TimePicker/WeekGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { parseLocalDateTime, formatLocalDateTime } from '@/utils/dateHelpers';

const ClientBookings = () => {
  const { signOut, profile } = useAuth();
  const config = useConfig();
  const { bookings: allConfirmedBookings, isLoading: slotsLoading, refetch: refetchSlots } = useSlots();
  const [myBookings, setMyBookings] = useState<any[]>([]);

  // Sélection de service
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Fetch bookings only when profile is loaded
  useEffect(() => {
    if (profile?.id) {
      updatePastBookings();
      fetchMyBookings();
    }
  }, [profile?.id]);

  // Fonction pour marquer automatiquement les bookings passés comme "completed"
  const updatePastBookings = async () => {
    if (!profile?.id) return;

    const now = new Date().toISOString();

    const { data: pastBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, end_time')
      .eq('user_id', profile.id)
      .eq('status', 'confirmed')
      .lt('end_time', now);

    if (fetchError) {
      console.error('Error fetching past bookings:', fetchError);
      return;
    }

    if (!pastBookings || pastBookings.length === 0) return;

    const bookingIds = pastBookings.map(b => b.id);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .in('id', bookingIds);

    if (updateError) {
      console.error('Error updating past bookings:', updateError);
    }
  };

  const fetchMyBookings = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', profile.id)
      .eq('client_id', import.meta.env.VITE_CLIENT_ID)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Impossible de charger les réservations');
      console.error('Error fetching bookings:', error);
    } else {
      setMyBookings(data || []);
    }
  };

  const bookSlotWithService = async (startTime: Date) => {
    if (!profile?.id) {
      toast.error('Veuillez vous connecter pour réserver');
      return;
    }

    if (!selectedService) {
      toast.error('Veuillez sélectionner un service');
      return;
    }

    const service = config.services.find(s => s.id === selectedService);
    if (!service) {
      toast.error('Service introuvable');
      return;
    }

    // Vérification de sécurité - empêcher les réservations multiples
    const futureBooking = myBookings.find(b =>
      b.status === 'confirmed' &&
      parseLocalDateTime(b.start_time) > new Date()
    );

    if (futureBooking) {
      const bookingDate = parseLocalDateTime(futureBooking.start_time);
      toast.error(
        `Vous avez déjà un rendez-vous programmé le ${bookingDate.toLocaleDateString('fr-FR', {
          day: 'numeric',
          month: 'long',
        })} à ${bookingDate.toLocaleTimeString('fr-FR', {
          hour: 'numeric',
          minute: '2-digit',
        })}. Veuillez attendre après ce rendez-vous pour réserver à nouveau.`
      );
      return;
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.duration);

    const { error: bookingError } = await supabase.from('bookings').insert({
      client_id: import.meta.env.VITE_CLIENT_ID,
      user_id: profile.id,
      service_id: service.id,
      duration: service.duration,
      start_time: formatLocalDateTime(startTime),
      end_time: formatLocalDateTime(endTime),
      status: 'confirmed',
    });

    if (bookingError) {
      if (bookingError.code === '23505') {
        toast.error('Ce créneau est déjà réservé');
      } else {
        toast.error('Impossible de réserver ce créneau');
        console.error(bookingError);
      }
    } else {
      toast.success(`${service.name} réservé avec succès pour ${startTime.toLocaleTimeString('fr-FR')} !`);
      refetchSlots();
      fetchMyBookings();
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const { error: bookingError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (bookingError) {
      toast.error('Impossible d\'annuler la réservation');
    } else {
      toast.success('Réservation annulée');
      refetchSlots();
      fetchMyBookings();
    }
  };

  if (slotsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0 hover:opacity-75 transition-opacity">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.brandName} className="w-8 h-8 sm:w-10 sm:h-10 object-contain flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">{config.brandName}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Mes réservations</p>
            </div>
          </Link>
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={signOut}>
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Sélection de service */}
        <Card>
          <CardHeader>
            <CardTitle>Choisissez votre service</CardTitle>
            <CardDescription>Sélectionnez le service que vous souhaitez réserver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.services.filter(s => s.enabled).map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all ${
                    selectedService === service.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold">{service.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {service.description}
                        </p>
                        <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                          <span className="text-xs sm:text-sm font-medium">
                            {service.duration} min
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-primary">
                            {service.price}€
                          </span>
                        </div>
                      </div>
                      {selectedService === service.id && (
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sélecteur de créneaux */}
        {selectedService && (() => {
          const service = config.services.find(s => s.id === selectedService);
          if (!service) return null;

          const futureBooking = myBookings.find(b =>
            b.status === 'confirmed' &&
            new Date(b.start_time) > new Date()
          );

          if (futureBooking) {
            const bookingDate = parseLocalDateTime(futureBooking.start_time);
            const bookingService = config.services.find(s => s.id === futureBooking.service_id);

            return (
              <Card>
                <CardHeader>
                  <CardTitle>Réservation non disponible</CardTitle>
                  <CardDescription>Vous avez déjà un rendez-vous à venir</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 sm:p-6 text-center space-y-3">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-base sm:text-lg">
                        {bookingService?.name || 'Rendez-vous'} programmé
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        {bookingDate.toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        à {bookingDate.toLocaleTimeString('fr-FR', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground pt-2">
                      Vous pourrez réserver un nouveau rendez-vous après celui-ci.
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card>
              <CardHeader>
                <CardTitle>Créneaux disponibles</CardTitle>
                <CardDescription>
                  Sélectionnez un créneau pour votre {service.name} ({service.duration} min)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TimePickerWeekGrid
                  bookings={allConfirmedBookings}
                  openingHours={config.openingHours}
                  serviceDuration={service.duration}
                  granularity={config.bookingSettings?.timeSlotGranularity ?? 30}
                  accentColor={config.theme?.primaryColor || '#0EA5E9'}
                  onTimeSelect={(startTime) => bookSlotWithService(startTime)}
                />
              </CardContent>
            </Card>
          );
        })()}

        <Card>
          <CardHeader>
            <CardTitle>Mes réservations</CardTitle>
            <CardDescription>Consultez et gérez vos rendez-vous</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    {booking.service_id && (() => {
                      const service = config.services.find(s => s.id === booking.service_id);
                      return service ? (
                        <p className="font-semibold text-sm sm:text-base text-primary">{service.name}</p>
                      ) : null;
                    })()}

                    <p className="font-medium text-sm sm:text-base mt-1">
                      {parseLocalDateTime(booking.start_time).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>

                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                      {parseLocalDateTime(booking.start_time).toLocaleTimeString('fr-FR', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {parseLocalDateTime(booking.end_time).toLocaleTimeString('fr-FR', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {booking.duration && ` (${booking.duration} min)`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                    {booking.status === 'confirmed' ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-primary/10 text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="hidden sm:inline">Confirmé</span>
                        </span>
                        {config.bookingSettings?.allowCancellation && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => cancelBooking(booking.id)}
                          >
                            Annuler
                          </Button>
                        )}
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
                        <XCircle className="h-3 w-3" />
                        <span className="hidden sm:inline">{booking.status === 'completed' ? 'Terminé' : 'Annulé'}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {myBookings.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucune réservation pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientBookings;
