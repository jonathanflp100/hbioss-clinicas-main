import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"

export function StatsCards() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    monthlyRevenue: 0,
    whatsappMessages: 0,
    previousMonthPatients: 0,
    previousMonthAppointments: 0,
    previousMonthRevenue: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const now = new Date()
        const today = now.toLocaleDateString('sv') // Formato YYYY-MM-DD no fuso horário local
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('sv')
        const firstDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
        const lastDayOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

        // Total de pacientes
        const { data: patients } = await supabase
          .from('patients')
          .select('id, created_at')
          .eq('user_id', user.id)

        const totalPatients = patients?.length || 0
        const previousMonthPatients = patients?.filter(p => 
          p.created_at >= firstDayOfPreviousMonth && p.created_at <= lastDayOfPreviousMonth
        ).length || 0

        // Compromissos hoje
        const { data: todayAppts } = await supabase
          .from('appointments')
          .select('id')
          .eq('user_id', user.id)
          .eq('appointment_date', today)

        const todayAppointments = todayAppts?.length || 0

        // Compromissos do mês anterior (mesmo dia)
        const previousMonthDay = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString().split('T')[0]
        const { data: previousDayAppts } = await supabase
          .from('appointments')
          .select('id')
          .eq('user_id', user.id)
          .eq('appointment_date', previousMonthDay)

        const previousMonthAppointments = previousDayAppts?.length || 0

        // Faturamento mensal
        const { data: monthlyTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'entrada')
          .gte('transaction_date', firstDayOfMonth)

        const monthlyRevenue = monthlyTransactions?.reduce((total, t) => total + (Number(t.amount) || 0), 0) || 0

        // Faturamento do mês anterior
        const { data: previousMonthTransactions } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'receita')
          .gte('transaction_date', firstDayOfPreviousMonth)
          .lte('transaction_date', lastDayOfPreviousMonth)

        const previousMonthRevenue = previousMonthTransactions?.reduce((total, t) => total + (Number(t.amount) || 0), 0) || 0

        setStats({
          totalPatients,
          todayAppointments,
          monthlyRevenue,
          whatsappMessages: 0, // Placeholder - implementar quando tiver integração WhatsApp
          previousMonthPatients,
          previousMonthAppointments,
          previousMonthRevenue
        })

      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error)
      }
    }

    fetchStats()
  }, [])

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const statsData = [
    {
      title: "Total de Pacientes",
      value: stats.totalPatients.toString(),
      change: `${calculateChange(stats.totalPatients, stats.previousMonthPatients) >= 0 ? '+' : ''}${calculateChange(stats.totalPatients, stats.previousMonthPatients)}%`,
      isPositive: calculateChange(stats.totalPatients, stats.previousMonthPatients) >= 0,
      icon: Users,
      color: "text-primary"
    },
    {
      title: "Compromissos Hoje",
      value: stats.todayAppointments.toString(),
      change: `${calculateChange(stats.todayAppointments, stats.previousMonthAppointments) >= 0 ? '+' : ''}${calculateChange(stats.todayAppointments, stats.previousMonthAppointments)}%`,
      isPositive: calculateChange(stats.todayAppointments, stats.previousMonthAppointments) >= 0,
      icon: Calendar,
      color: "text-primary/80"
    },
    {
      title: "Faturamento Mensal",
      value: `R$ ${(stats.monthlyRevenue / 1000).toFixed(1)}k`,
      change: `${calculateChange(stats.monthlyRevenue, stats.previousMonthRevenue) >= 0 ? '+' : ''}${calculateChange(stats.monthlyRevenue, stats.previousMonthRevenue)}%`,
      isPositive: calculateChange(stats.monthlyRevenue, stats.previousMonthRevenue) >= 0,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Mensagens WhatsApp",
      value: stats.whatsappMessages.toString(),
      change: "N/A",
      isPositive: true,
      icon: MessageSquare,
      color: "text-primary/60"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <Card key={index} className="bg-card-elevated border-border/50 hover:shadow-lg transition-all duration-200 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs">
              {stat.change !== "N/A" && (
                <>
                  {stat.isPositive ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className={stat.isPositive ? "text-success" : "text-destructive"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">vs mês anterior</span>
                </>
              )}
              {stat.change === "N/A" && (
                <span className="text-muted-foreground">Em breve</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}