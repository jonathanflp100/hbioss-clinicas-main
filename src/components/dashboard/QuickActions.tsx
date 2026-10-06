import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Calendar, MessageSquare, DollarSign, BarChart3 } from "lucide-react"
import { Link } from "react-router-dom"

const quickActions = [
 {
    title: "Novo Paciente",
    icon: UserPlus,
    href: "/clientes", // Alterado de /clientes/novo
    color: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
  },
  {
    title: "Agendar",
    icon: Calendar,
    href: "/agenda", // Alterado de /agenda/novo
    color: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20"
  },
  {
    title: "WhatsApp",
    icon: MessageSquare,
    href: "/whatsapp",
    color: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    href: "/financeiro", // Alterado de /financeiro/novo
    color: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
  },
  {
    title: "Relatórios",
    icon: BarChart3,
    href: "/relatorios",
    color: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
  }
]

export function QuickActions() {
  return (
    <Card className="bg-card-elevated border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.href}>
              <Button 
                variant="ghost" 
                className={`h-auto p-4 flex flex-col items-center gap-2 w-full ${action.color} transition-all duration-200`}
              >
                <action.icon className="w-6 h-6" />
                <span className="font-medium text-xs text-center">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}