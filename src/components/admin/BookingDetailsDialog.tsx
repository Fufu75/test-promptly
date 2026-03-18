import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { parseLocalDateTime } from '@/utils/dateHelpers';
import type { Booking, Service } from '@/types';

interface BookingDetailsDialogProps {
  booking: Booking | null;
  services: Service[];
  onClose: () => void;
  onCancel: (bookingId: string, slotId: string) => void;
}

/**
 * BookingDetailsDialog - Modale de détails d'une réservation
 * Affiche toutes les informations de la réservation et permet de l'annuler
 */
export const BookingDetailsDialog = ({
  booking,
  services,
  onClose,
  onCancel,
}: BookingDetailsDialogProps) => {
  if (!booking) return null;

  const service = services.find(s => s.id === booking.service_id);
  const startTime = parseLocalDateTime(booking.start_time);
  const endTime = parseLocalDateTime(booking.end_time);

  return (
    <Dialog open={!!booking} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la réservation</DialogTitle>
          <DialogDescription>{service?.name || 'Rendez-vous'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="font-semibold">
                {booking.user?.full_name || booking.user?.email}
              </p>
              <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
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

            {booking.notes && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">Notes</p>
                <p className="text-sm">{booking.notes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                onCancel(booking.id, booking.slot_id);
                onClose();
              }}
              variant="destructive"
              className="flex-1"
            >
              Annuler la réservation
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
