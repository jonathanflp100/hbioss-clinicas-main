import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Webhook, Send, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const webhookHistory: Array<{
  id: number;
  url: string;
  status: string;
  timestamp: string;
  response: string;
}> = []

export default function N8NIntegration() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [jsonData, setJsonData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleTriggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "Por favor, insira a URL do webhook",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const payload = jsonData ? JSON.parse(jsonData) : {
        timestamp: new Date().toISOString(),
        triggered_from: "Business CRM",
        source: window.location.origin,
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify(payload),
      })

      toast({
        title: "Webhook Enviado",
        description: "O webhook foi enviado para o N8N. Verifique o histórico do seu workflow.",
      })
    } catch (error) {
      console.error("Erro ao enviar webhook:", error)
      toast({
        title: "Erro",
        description: "Falha ao enviar o webhook. Verifique a URL e tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="w-4 h-4 text-success" />
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />
      case "pending": return <Clock className="w-4 h-4 text-warning" />
      default: return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-success text-success-foreground"
      case "error": return "bg-destructive text-destructive-foreground"
      case "pending": return "bg-warning text-warning-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integração N8N</h1>
        <p className="text-muted-foreground">
          Configure e teste integrações com seus workflows N8N
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhook Trigger */}
        <Card className="bg-card-elevated border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5" />
              Trigger Webhook
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTriggerWebhook} className="space-y-4">
              <div>
                <Label htmlFor="webhook-url">URL do Webhook N8N</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://sua-instancia-n8n.com/webhook/seu-webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="bg-muted/50"
                />
              </div>

              <div>
                <Label htmlFor="json-data">Dados JSON (opcional)</Label>
                <Textarea
                  id="json-data"
                  placeholder='{"cliente": "João Silva", "acao": "novo_cliente"}'
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  className="bg-muted/50 min-h-[100px]"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading || !webhookUrl}
                className="w-full bg-gradient-primary text-white hover:opacity-90"
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Enviando..." : "Enviar Webhook"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Webhook History */}
        <Card className="bg-card-elevated border-border/50">
          <CardHeader>
            <CardTitle>Histórico de Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {webhookHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum webhook enviado ainda.</p>
                  <p className="text-sm">O histórico aparecerá aqui após o primeiro envio.</p>
                </div>
              ) : (
                webhookHistory.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    </div>
                    
                    <div className="text-sm text-foreground font-mono bg-muted/30 p-2 rounded truncate">
                      {item.url}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-1">
                      Resposta: {item.response}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Info */}
      <Card className="bg-card-elevated border-border/50">
        <CardHeader>
          <CardTitle>Como Integrar com N8N</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">1. Configure o Webhook no N8N</h4>
              <p className="text-sm text-muted-foreground">
                Crie um workflow no N8N com um trigger "Webhook" e configure a URL
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">2. Use a URL aqui</h4>
              <p className="text-sm text-muted-foreground">
                Cole a URL do webhook gerada pelo N8N no campo acima
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">3. Envie Dados</h4>
              <p className="text-sm text-muted-foreground">
                Configure os dados JSON que serão enviados para o workflow
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">4. Monitore</h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe o status e histórico das execuções
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}