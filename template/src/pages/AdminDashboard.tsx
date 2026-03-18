import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyCalendarVertical } from '@/components/WeeklyCalendarVertical';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogOut, Calendar, Users } from 'lucide-react';
import { parseLocalDateTime, formatLocalDateTime } from '@/utils/dateHelpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const config = useConfig();
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // État pour la création de plage
  const [createSlotDialog, setCreateSlotDialog] = useState<{
    open: boolean;
    date: Date | null;
    startHour: number | null;
  }>({ open: false, date: null, startHour: null });
  const [startHour, setStartHour] = useState<string>('');
  const [endHour, setEndHour] = useState<string>('');

  useEffect(() => {
    archivePastSlots();
    updatePastBookings();
    fetchSlots();
    fetchBookings();
  }, []);

  // Fonction pour archiver automatiquement les slots passés
  const archivePastSlots = async () => {
    const now = new Date().toISOString();

    // Récupérer tous les slots actifs qui sont passés
    const { data: pastSlots, error: fetchError } = await supabase
      .from('slots')
      .select('id, end_time')
      .eq('status', 'active')
      .lt('end_time', now); // end_time < maintenant

    if (fetchError) {
      console.error('Error fetching past slots:', fetchError);
      return;
    }

    if (!pastSlots || pastSlots.length === 0) {
      return;
    }

    // Mettre à jour tous les slots passés en "archived"
    const slotIds = pastSlots.map(s => s.id);

    const { error: updateError } = await supabase
      .from('slots')
      .update({ status: 'archived' })
      .in('id', slotIds);

    if (updateError) {
      console.error('Error archiving past slots:', updateError);
    } else {
      console.log(`${pastSlots.length} past slot(s) marked as archived`);
    }
  };

  // Fonction pour marquer automatiquement les bookings passés comme "completed"
  const updatePastBookings = async () => {
    const now = new Date().toISOString();

    // Récupérer tous les bookings confirmés qui sont passés
    const { data: pastBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, end_time')
      .eq('status', 'confirmed')
      .lt('end_time', now);

    if (fetchError) {
      console.error('Error fetching past bookings:', fetchError);
      return;
    }

    if (!pastBookings || pastBookings.length === 0) {
      return;
    }

    // Mettre à jour tous les bookings passés en "completed"
    const bookingIds = pastBookings.map(b => b.id);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .in('id', bookingIds);

    if (updateError) {
      console.error('Error updating past bookings:', updateError);
    } else {
      console.log(`${pastBookings.length} past booking(s) marked as completed`);
    }
  };

  const fetchSlots = async () => {
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      toast.error('Impossible de charger les plages');
    } else {
      setSlots(data || []);
    }
    setLoading(false);
  };

  const fetchBookings = async () => {
    const { data, error} = await supabase
      .from('bookings')
      .select(`
        *,
        slots(*),
        profiles(*)
      `)
      .in('status', ['confirmed', 'completed'])
      .order('start_time', { ascending: false });

    if (error) {
      toast.error('Impossible de charger les réservations');
    } else {
      // Map the data to add user and slot aliases
      const mappedData = data?.map(booking => ({
        ...booking,
        user: booking.profiles,
        slot: booking.slots
      }));
      setBookings(mappedData || []);
    }
  };

  const getBookingsForSlot = (slotId: string) => {
    // Retourne tous les bookings (confirmed et completed) pour un slot
    return bookings.filter(booking => booking.slot_id === slotId);
  };

  const cancelBookingAsAdmin = async (bookingId: string, slotId: string) => {
    // Delete booking from database
    const { error: bookingError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (bookingError) {
      toast.error('Impossible d\'annuler la réservation');
    } else {
      // Update slot availability back to true
      const { error: slotError } = await supabase
        .from('slots')
        .update({ is_available: true })
        .eq('id', slotId);

      if (slotError) {
        toast.error('Impossible de mettre à jour la disponibilité');
      } else {
        toast.success('Réservation annulée avec succès');
      }

      fetchBookings();
      fetchSlots();
      setSelectedSlot(null);
    }
  };

  // Récupère les heures d'ouverture min et max pour un jour donné
  const getOpeningHoursForDay = (date: Date): { min: number; max: number } => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()];
    const dayHours = config.openingHours[dayName];

    if (dayHours === 'Closed') return { min: 9, max: 17 }; // Par défaut si fermé

    const [startStr, endStr] = dayHours.split('-');
    return {
      min: parseInt(startStr.split(':')[0]),
      max: parseInt(endStr.split(':')[0]),
    };
  };

  // Ouvre la modale de création de plage
  const openCreateSlotDialog = (date: Date, hour: number) => {
    setCreateSlotDialog({ open: true, date, startHour: hour });
    setStartHour(''); // Reset l'heure de début
    setEndHour(''); // Reset l'heure de fin
  };

  // Crée la plage avec les heures de début et fin choisies
  const confirmCreateSlot = async () => {
    if (!createSlotDialog.date || !startHour || !endHour) {
      toast.error('Veuillez sélectionner les heures de début et de fin');
      return;
    }

    const startTime = new Date(createSlotDialog.date);
    startTime.setHours(parseInt(startHour), 0, 0, 0);
    const endTime = new Date(createSlotDialog.date);
    endTime.setHours(parseInt(endHour), 0, 0, 0);

    // Validation : end > start
    if (endTime <= startTime) {
      toast.error('L\'heure de fin doit être après l\'heure de début');
      return;
    }

    // Validation : vérifier qu'il n'y a pas de chevauchement avec d'autres slots actifs
    const hasOverlap = slots.some(slot => {
      if (slot.status !== 'active') return false; // Ignorer les slots archivés

      const slotStart = parseLocalDateTime(slot.start_time);
      const slotEnd = parseLocalDateTime(slot.end_time);

      // Vérifier si c'est le même jour
      const isSameDay =
        slotStart.getFullYear() === startTime.getFullYear() &&
        slotStart.getMonth() === startTime.getMonth() &&
        slotStart.getDate() === startTime.getDate();

      if (!isSameDay) return false;

      // Vérifier le chevauchement : deux intervalles [A, B] et [C, D] se chevauchent si A < D ET C < B
      // Note: on utilise < pour end_time car '[)' exclut la fin (12:00-14:00 et 14:00-16:00 ne se chevauchent pas)
      return startTime < slotEnd && slotStart < endTime;
    });

    if (hasOverlap) {
      toast.error('Cette plage chevauche une plage existante. Veuillez choisir des horaires différents.');
      return;
    }

    const { error } = await supabase.from('slots').insert({
      start_time: formatLocalDateTime(startTime),
      end_time: formatLocalDateTime(endTime),
      is_available: true,
      created_by: profile?.id,
    });

    if (error) {
      // Si l'erreur vient de la contrainte d'exclusion en base
      if (error.message.includes('slots_no_time_overlap')) {
        toast.error('Cette plage chevauche une plage existante');
      } else {
        toast.error('Impossible de créer la plage');
      }
    } else {
      toast.success(`Plage créée : ${startHour}h - ${endHour}h`);
      fetchSlots();
      setCreateSlotDialog({ open: false, date: null, startHour: null });
      setStartHour('');
      setEndHour('');
    }
  };

  const deleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('slots')
      .delete()
      .eq('id', slotId);

    if (error) {
      toast.error('Impossible de supprimer la plage');
    } else {
      toast.success('Plage supprimée');
      fetchSlots();
      setSelectedSlot(null);
    }
  };

  if (loading) {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total des plages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slots.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Plages disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {slots.filter(s => s.is_available).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Réservations actives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Planning hebdomadaire</CardTitle>
            <CardDescription>Cliquez sur les réservations pour les gérer, ou sur les zones vides pour créer des plages</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyCalendarVertical
              slots={slots}
              bookings={bookings}
              onBookingClick={setSelectedBooking}
              onSlotClick={setSelectedSlot}
              onCreateSlot={openCreateSlotDialog}
              isAdmin={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Toutes les réservations
            </CardTitle>
            <CardDescription>
              {bookings.filter(b => b.status === 'confirmed').length} à venir • {bookings.filter(b => b.status === 'completed').length} terminées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune réservation pour le moment</p>
              ) : (
                bookings.map((booking) => {
                  const service = config.services.find(s => s.id === booking.service_id);
                  const startTime = booking.start_time ? parseLocalDateTime(booking.start_time) : parseLocalDateTime(booking.slot?.start_time);
                  const endTime = booking.end_time ? parseLocalDateTime(booking.end_time) : null;

                  return (
                    <div
                      key={booking.id}
                      className="flex items-center gap-2 sm:gap-4 p-3 sm:p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      {/* Indicateur de couleur du service */}
                      <div
                        className="w-1 h-14 sm:h-16 rounded-full flex-shrink-0"
                        style={{ backgroundColor: service?.color || config.theme.primaryColor }}
                      />

                      {/* Informations du booking */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm sm:text-base truncate">
                            {booking.user?.full_name || booking.user?.email}
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
                            {startTime.toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {endTime && (
                              <> - {endTime.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}</>
                            )}
                          </span>
                          {booking.duration && (
                            <span className="text-[10px] sm:text-xs">({booking.duration}min)</span>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="text-right flex-shrink-0">
                        {booking.status === 'confirmed' ? (
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

      {/* Modale de création de plage */}
      <Dialog
        open={createSlotDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setCreateSlotDialog({ open: false, date: null, startHour: null });
            setStartHour('');
            setEndHour('');
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une plage horaire</DialogTitle>
            <DialogDescription>
              {createSlotDialog.date &&
                `Choisissez les horaires d'ouverture pour le ${createSlotDialog.date.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Start Time */}
            <div>
              <Label htmlFor="start-hour">Heure de début</Label>
              <Select value={startHour} onValueChange={setStartHour}>
                <SelectTrigger id="start-hour">
                  <SelectValue placeholder="Sélectionnez l'heure de début" />
                </SelectTrigger>
                <SelectContent>
                  {createSlotDialog.date &&
                    (() => {
                      const { min, max } = getOpeningHoursForDay(createSlotDialog.date);
                      return Array.from({ length: max - min }, (_, i) => {
                        const hour = min + i;
                        return (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour}:00
                          </SelectItem>
                        );
                      });
                    })()
                  }
                </SelectContent>
              </Select>
            </div>

            {/* End Time */}
            <div>
              <Label htmlFor="end-hour">Heure de fin</Label>
              <Select value={endHour} onValueChange={setEndHour} disabled={!startHour}>
                <SelectTrigger id="end-hour">
                  <SelectValue placeholder="Sélectionnez l'heure de fin" />
                </SelectTrigger>
                <SelectContent>
                  {startHour && createSlotDialog.date &&
                    (() => {
                      const { max } = getOpeningHoursForDay(createSlotDialog.date);
                      const start = parseInt(startHour);
                      return Array.from({ length: max - start }, (_, i) => {
                        const hour = start + i + 1;
                        return (
                          <SelectItem key={hour} value={hour.toString()}>
                            {hour}:00
                          </SelectItem>
                        );
                      });
                    })()
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={confirmCreateSlot}
                className="flex-1"
                disabled={!startHour || !endHour}
              >
                Créer la plage
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCreateSlotDialog({ open: false, date: null, startHour: null });
                  setStartHour('');
                  setEndHour('');
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale de gestion de slot existant */}
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gérer la plage horaire</DialogTitle>
            <DialogDescription>
              {selectedSlot && (
                <>
                  {parseLocalDateTime(selectedSlot.start_time).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' • '}
                  {parseLocalDateTime(selectedSlot.start_time).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' - '}
                  {parseLocalDateTime(selectedSlot.end_time).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (() => {
            const slotBookings = getBookingsForSlot(selectedSlot.id);
            const hasBookings = slotBookings.length > 0;

            return (
              <div className="space-y-4">
                {hasBookings ? (
                  <>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <p className="text-sm font-medium mb-3">
                        {slotBookings.length} réservation{slotBookings.length !== 1 ? 's' : ''} dans cette plage :
                      </p>
                      <div className="space-y-3">
                        {slotBookings.map((booking) => {
                          const service = config.services.find(s => s.id === booking.service_id);
                          const startTime = parseLocalDateTime(booking.start_time);
                          const endTime = parseLocalDateTime(booking.end_time);

                          return (
                            <div
                              key={booking.id}
                              className={`flex items-center gap-3 p-3 bg-background rounded-md border ${
                                booking.status === 'completed' ? 'opacity-60' : ''
                              }`}
                            >
                              <div
                                className="w-1 h-12 rounded-full"
                                style={{ backgroundColor: booking.status === 'completed' ? '#9ca3af' : (service?.color || config.theme.primaryColor) }}
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm">
                                    {booking.user?.full_name || booking.user?.email}
                                  </p>
                                  {booking.status === 'completed' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                      Terminé
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <span className="font-medium">
                                    {startTime.toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                    {' - '}
                                    {endTime.toLocaleTimeString('fr-FR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  <span>•</span>
                                  <span>{service?.name || 'Service'}</span>
                                  {booking.duration && <span>({booking.duration}min)</span>}
                                </div>
                              </div>
                              {booking.status === 'confirmed' && (
                                <Button
                                  onClick={() => {
                                    cancelBookingAsAdmin(booking.id, selectedSlot.id);
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  Annuler
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => deleteSlot(selectedSlot.id)}
                        disabled
                        className="flex-1"
                      >
                        Impossible de supprimer (contient des réservations)
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSlot(null)}
                      >
                        Fermer
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm p-4 bg-muted/50 rounded-lg">
                      Statut : <span className="text-primary font-medium">
                        Disponible - Aucune réservation
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => deleteSlot(selectedSlot.id)}
                        className="flex-1"
                      >
                        Supprimer la plage
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSlot(null)}
                      >
                        Fermer
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

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

            return (
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Client</p>
                    <p className="font-semibold">
                      {selectedBooking.user?.full_name || selectedBooking.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedBooking.user?.email}
                    </p>
                  </div>

                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">Service</p>
                    <p className="font-medium">{service?.name || 'Service inconnu'}</p>
                    <p className="text-sm text-muted-foreground">
                      {service?.duration} minutes • {service?.price}€
                    </p>
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
                      {startTime.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {endTime.toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
                  <Button
                    onClick={() => {
                      cancelBookingAsAdmin(selectedBooking.id, selectedBooking.slot_id);
                      setSelectedBooking(null);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    Annuler la réservation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedBooking(null)}
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
