import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Slot, Booking } from '@/types';

interface AdminStatsCardsProps {
  slots: Slot[];
  bookings: Booking[];
}

/**
 * AdminStatsCards - Cartes de statistiques pour le dashboard admin
 * Affiche le total des plages, plages disponibles et réservations actives
 */
export const AdminStatsCards = ({ slots, bookings }: AdminStatsCardsProps) => {
  const availableSlots = slots.filter(s => s.is_available).length;

  return (
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
          <div className="text-2xl font-bold text-primary">{availableSlots}</div>
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
  );
};
