import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyCalendarVertical } from '@/components/WeeklyCalendarVertical';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Calendar, Users, TrendingUp } from 'lucide-react';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Booking } from '@/types';
import { BOOKING_STATUS } from '@/constants';

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const config = useConfig();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updatePastBookings();
    fetchBookings();
  }, []);

  // Marquer automatiquement les bookings passés comme "completed"
  const updatePastBookings = async () => {
    const now = new Date().toISOString();

    const { data: pastBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id')
      .eq('client_id', CLIENT_ID)
      .eq('status', BOOKING_STATUS.CONFIRMED)
      .lt('end_time', now);

    if (fetchError || !pastBookings || pastBookings.length === 0) return;

    const { error } = await supabase
      .from('bookings')
      .update({ status: BOOKING_STATUS.COMPLETED })
      .in('id', pastBookings.map(b => b.id));

    if (error) console.error('Error updating past bookings:', error);
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(*)')
      .eq('client_id', CLIENT_ID)
      .in('status', [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED])
      .order('start_time', { ascending: false });

    if (error) {
      toast.error('Impossible de charger les réservations');
    } else {
      setBookings((data || []).map(b => ({ ...b, user: b.profiles })) as Booking[]);
    }
    setLoading(false);
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      toast.error('Impossible d\'annuler la réservation');
    } else {
      toast.success('Réservation annulée');
      setSelectedBooking(null);
      fetchBookings();
    }
  };

  // Stats
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const todayBookings = bookings.filter(b => b.start_time?.startsWith(todayStr));
  const upcomingBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED);
  const completedBookings = bookings.filter(b => b.status === BOOKING_STATUS.COMPLETED);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl font-bold truncate">{config.brandName}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Tableau de bord admin</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="flex-shrink-0" onClick={signOut}>
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Se déconnecter</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">réservation{todayBookings.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                À venir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{upcomingBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">confirmée{upcomingBookings.length !== 1 ? 's' : ''}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Terminées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">au total</p>
            </CardContent>
          </Card>
        </div>

        {/* Planning hebdomadaire */}
        <Card>
          <CardHeader>
            <CardTitle>Planning hebdomadaire</CardTitle>
            <CardDescription>Cliquez sur une réservation pour voir les détails</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyCalendarVertical
              bookings={bookings}
              onBookingClick={setSelectedBooking}
            />
          </CardContent>
        </Card>

        {/* Liste des réservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Toutes les réservations
            </CardTitle>
            <CardDescription>
              {upcomingBookings.length} à venir • {completedBookings.length} terminées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune réservation pour le moment</p>
              ) : (
                bookings.map((booking) => {
                  const service = config.services.find(s => s.id === booking.service_id);
                  const startTime = parseLocalDateTime(booking.start_time);
                  const endTime = parseLocalDateTime(booking.end_time);

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <div
                        className="w-1 h-14 sm:h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: booking.status === BOOKING_STATUS.COMPLETED ? '#9ca3af' : (service?.color || config.theme.primaryColor) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {booking.user?.full_name || booking.user?.email || booking.profiles?.full_name || 'Client'}
                          </p>
                          <span
                            className="text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: `${service?.color || config.theme.primaryColor}20`,
                              color: service?.color || config.theme.primaryColor,
                            }}
                          >
                            {service?.name || 'Service'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground flex-wrap">
                          <span className="whitespace-nowrap">
                            {startTime.toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                          <span className="font-medium whitespace-nowrap">
                            {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {service?.duration && (
                            <span className="text-[10px] sm:text-xs">({service.duration}min)</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {booking.status === BOOKING_STATUS.CONFIRMED ? (
                          <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-primary/10 text-primary">
                            À venir
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-muted text-muted-foreground">
                            Terminé
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Modale de détails d'un booking */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogDescription>
              {selectedBooking && (() => {
                const service = config.services.find(s => s.id === selectedBooking.service_id);
                return service?.name || 'Rendez-vous';
              })()}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (() => {
            const service = config.services.find(s => s.id === selectedBooking.service_id);
            const startTime = parseLocalDateTime(selectedBooking.start_time);
            const endTime = parseLocalDateTime(selectedBooking.end_time);
            const clientName = selectedBooking.user?.full_name || selectedBooking.profiles?.full_name || 'Client';
            const clientEmail = selectedBooking.user?.email || selectedBooking.profiles?.email;

            return (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-semibold">{clientName}</p>
                    {clientEmail && <p className="text-xs text-muted-foreground">{clientEmail}</p>}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p className="font-medium">{service?.name || 'Service inconnu'}</p>
                    {service && (
                      <p className="text-sm text-muted-foreground">
                        {service.duration} minutes • {service.price}€
                      </p>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">Date & Heure</p>
                    <p className="font-medium">
                      {startTime.toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm">
                      {startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedBooking.status === BOOKING_STATUS.CONFIRMED && (
                    <Button
                      onClick={() => cancelBooking(selectedBooking.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      Annuler la réservation
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBooking(null)}
                    className={selectedBooking.status !== BOOKING_STATUS.CONFIRMED ? 'flex-1' : ''}
                  >
                    Fermer
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
