import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface ConfigureN8NModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userId: string;
}

export function ConfigureN8NModal({ open, onOpenChange, userName, userId }: ConfigureN8NModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    n8nUrl: "",
    apiKey: "",
    workflowId: "",
    webhookUrl: "",
    enabled: true,
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aqui seria a lógica para salvar a configuração N8N
    console.log("Configuração N8N para usuário:", userId, formData);
    
    toast({
      title: "Configuração salva",
      description: `N8N configurado com sucesso para ${userName}.`,
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar N8N</DialogTitle>
          <DialogDescription>
            Configure a integração N8N para {userName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL do N8N */}
          <div className="space-y-2">
            <Label htmlFor="n8nUrl">URL do N8N</Label>
            <Input
              id="n8nUrl"
              value={formData.n8nUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, n8nUrl: e.target.value }))}
              placeholder="https://n8n.example.com"
              required
            />
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="n8n_api_key_here"
              required
            />
          </div>

          {/* Workflow ID */}
          <div className="space-y-2">
            <Label htmlFor="workflowId">ID do Workflow</Label>
            <Input
              id="workflowId"
              value={formData.workflowId}
              onChange={(e) => setFormData(prev => ({ ...prev, workflowId: e.target.value }))}
              placeholder="123"
              required
            />
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">URL do Webhook</Label>
            <Input
              id="webhookUrl"
              value={formData.webhookUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))}
              placeholder="https://n8n.example.com/webhook/..."
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição do Fluxo</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o que este fluxo N8N faz..."
              rows={3}
            />
          </div>

          {/* Habilitado */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Habilitar Integração</Label>
              <p className="text-sm text-muted-foreground">
                Ativar o fluxo N8N para este usuário
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Configuração
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}