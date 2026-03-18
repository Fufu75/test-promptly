import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConfig } from '@/hooks/useConfig';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { WeeklyCalendarVertical } from '@/components/WeeklyCalendarVertical';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import type { Booking } from '@/types';
import { PageHeader } from '@/components/shared/PageHeader';
import { AdminBookingList } from '@/components/admin/AdminBookingList';
import { BookingDetailsDialog } from '@/components/admin/BookingDetailsDialog';
import { BOOKING_STATUS } from '@/constants';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const config = useConfig();

  const {
    bookings,
    isLoading: loadingBookings,
    fetchBookings,
    cancelBooking: cancelBookingHook,
    updatePastBookings,
  } = useAdminBookings();

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    updatePastBookings();
    fetchBookings();
  }, [updatePastBookings, fetchBookings]);

  // Cancel booking
  const cancelBooking = async (bookingId: string) => {
    await cancelBookingHook(bookingId);
    setSelectedBooking(null);
  };

  // Stats
  const confirmedBookings = bookings.filter(b => b.status === BOOKING_STATUS.CONFIRMED);
  const todayBookings = confirmedBookings.filter(b => {
    if (!b.start_time) return false;
    const bookingDate = new Date(b.start_time);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  });

  if (loadingBookings) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <PageHeader
        title={config.brandName}
        subtitle="Tableau de bord admin"
        icon={Calendar}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réservations aujourd'hui</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings.length}</div>
              <p className="text-xs text-muted-foreground">rendez-vous confirmés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Réservations à venir</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmedBookings.length}</div>
              <p className="text-xs text-muted-foreground">total confirmées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horaires d'ouverture</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {Object.entries(config.openingHours)
                  .filter(([, hours]) => hours !== 'Closed')
                  .slice(0, 1)
                  .map(([, hours]) => hours)}
              </div>
              <p className="text-xs text-muted-foreground">configurés dans config.json</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendrier */}
        <Card>
          <CardHeader>
            <CardTitle>Planning hebdomadaire</CardTitle>
            <CardDescription>
              Cliquez sur une réservation pour voir les détails ou l'annuler
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyCalendarVertical
              bookings={bookings}
              onBookingClick={setSelectedBooking}
            />
          </CardContent>
        </Card>

        {/* Liste des réservations */}
        <AdminBookingList
          bookings={bookings}
          services={config.services}
          primaryColor={config.theme.primaryColor}
          onBookingClick={setSelectedBooking}
        />
      </main>

      {/* Dialog détails réservation */}
      <BookingDetailsDialog
        booking={selectedBooking}
        services={config.services}
        onClose={() => setSelectedBooking(null)}
        onCancel={cancelBooking}
      />
    </div>
  );
};

export default AdminDashboard;
