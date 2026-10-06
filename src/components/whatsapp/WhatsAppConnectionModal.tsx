import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import { CheckCircle, Hourglass } from "lucide-react";

interface WhatsAppConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: string | null;
  isConnected: boolean;
}

export function WhatsAppConnectionModal({ open, onOpenChange, qrCode, isConnected }: WhatsAppConnectionModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar ao WhatsApp</DialogTitle>
          <DialogDescription>
            Abra o WhatsApp no seu telemóvel e leia o QR Code para conectar.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 bg-muted rounded-md h-72">
          {isConnected ? (
            <div className="text-center text-green-500">
              <CheckCircle className="w-24 h-24 mx-auto mb-4" />
              <p className="font-bold text-lg">Conectado com sucesso!</p>
            </div>
          ) : qrCode ? (
            <div className="bg-white p-4 rounded-lg">
                <QRCode value={qrCode} size={224} />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
                <Hourglass className="w-24 h-24 mx-auto mb-4 animate-spin" />
                <p className="font-bold text-lg">A aguardar QR Code...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}