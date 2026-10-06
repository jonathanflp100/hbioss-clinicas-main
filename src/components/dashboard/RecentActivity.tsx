import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([])

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Buscar compromissos recentes
        const { data: appointments } = await supabase
          .from('appointments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)

        // Buscar transações recentes
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(2)

        const recentActivities = []

        // Adicionar compromissos
        if (appointments) {
          appointments.forEach(apt => {
            recentActivities.push({
              id: `apt-${apt.id}`,
              type: "appointment",
              client: apt.patient_name,
              action: `Consulta ${apt.status === 'realizado' ? 'realizada' : apt.status === 'cancelado' ? 'cancelada' : 'agendada'}`,
              time: formatTimeAgo(apt.created_at),
              status: apt.status,
              icon: Calendar
            })
          })
        }

        // Adicionar transações
        if (transactions) {
          transactions.forEach(trans => {
            recentActivities.push({
              id: `trans-${trans.id}`,
              type: "transaction",
              client: trans.patient_name || 'Sistema',
              action: `${trans.type === 'receita' ? 'Receita' : 'Despesa'}: ${trans.description}`,
              time: formatTimeAgo(trans.created_at),
              status: trans.status,
              icon: DollarSign
            })
          })
        }

        // Ordenar por data de criação e limitar a 5
        recentActivities.sort((a, b) => b.id.localeCompare(a.id))
        setActivities(recentActivities.slice(0, 5))

      } catch (error) {
        console.error('Erro ao buscar atividades recentes:', error)
      }
    }

    fetchRecentActivity()
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return "há poucos minutos"
    if (diffInHours < 24) return `há ${diffInHours}h`
    if (diffInDays === 1) return "há 1 dia"
    if (diffInDays < 7) return `há ${diffInDays} dias`
    return date.toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string, type: string) => {
    if (type === "appointment") {
      switch (status) {
        case "realizado": return "bg-success text-success-foreground"
        case "pendente": return "bg-warning text-warning-foreground"
        case "cancelado": return "bg-destructive text-destructive-foreground"
        default: return "bg-muted text-muted-foreground"
      }
    } else {
      switch (status) {
        case "confirmado": return "bg-success text-success-foreground"
        case "pendente": return "bg-warning text-warning-foreground"
        default: return "bg-muted text-muted-foreground"
      }
    }
  }

  const getStatusText = (status: string, type: string) => {
    if (type === "appointment") {
      switch (status) {
        case "realizado": return "Realizado"
        case "pendente": return "Pendente"
        case "cancelado": return "Cancelado"
        default: return status
      }
    } else {
      switch (status) {
        case "confirmado": return "Confirmado"
        case "pendente": return "Pendente"
        default: return status
      }
    }
  }

  if (activities.length === 0) {
    return (
      <Card className="bg-card-elevated border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhuma atividade recente encontrada.</p>
            <p className="text-sm mt-2">As atividades aparecerão aqui conforme você usar o sistema.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors animate-fade-in">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {activity.client.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{activity.client}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getStatusColor(activity.status, activity.type)}`}>
                  {getStatusText(activity.status, activity.type)}
                </Badge>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}