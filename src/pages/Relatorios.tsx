import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const chartConfig = {
  agendamentos: {
    label: "Agendamentos",
  },
  pacientes: {
    label: "Pacientes",
  },
  financeiro: {
    label: "Financeiro",
  }
};

const Relatorios = () => {
  const [periodoFinanceiro, setPeriodoFinanceiro] = useState("mensal")
  const [agendamentosData, setAgendamentosData] = useState([
    { name: "Positivos", value: 0, color: "hsl(var(--chart-1))" },
    { name: "Perdidos", value: 0, color: "hsl(var(--chart-2))" },
    { name: "Re-agendados", value: 0, color: "hsl(var(--chart-3))" },
    { name: "Cancelados", value: 0, color: "hsl(var(--chart-4))" }
  ])
  const [pacientesData, setPacientesData] = useState([
    { name: "Ativos", value: 0, color: "hsl(var(--chart-1))" },
    { name: "Inativos", value: 0, color: "hsl(var(--chart-2))" }
  ])
  const [financeiroData, setFinanceiroData] = useState([
    { name: "Entradas", value: 0, color: "hsl(var(--chart-1))" },
    { name: "Saídas", value: 0, color: "hsl(var(--chart-2))" }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportsData()
  }, [periodoFinanceiro])

  const fetchReportsData = async () => {
    try {
      // Buscar dados de agendamentos
      const { data: appointments } = await supabase
        .from('appointments')
        .select('status')
      
      if (appointments) {
        const statusCounts = appointments.reduce((acc: any, apt: any) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1
          return acc
        }, {})

        setAgendamentosData([
          { name: "Realizados", value: statusCounts.realizado || 0, color: "hsl(var(--chart-1))" },
          { name: "Faltaram", value: statusCounts.faltou || 0, color: "hsl(var(--chart-2))" },
          { name: "Pendentes", value: statusCounts.pendente || 0, color: "hsl(var(--chart-3))" },
          { name: "Cancelados", value: statusCounts.cancelado || 0, color: "hsl(var(--chart-4))" }
        ])
      }

      // Buscar dados de pacientes
      const { data: patients } = await supabase
        .from('patients')
        .select('status')
      
      if (patients) {
        const patientStatusCounts = patients.reduce((acc: any, patient: any) => {
          acc[patient.status] = (acc[patient.status] || 0) + 1
          return acc
        }, {})

        setPacientesData([
          { name: "Ativos", value: patientStatusCounts.active || 0, color: "hsl(var(--chart-1))" },
          { name: "Inativos", value: patientStatusCounts.inactive || 0, color: "hsl(var(--chart-2))" }
        ])
      }

      // Buscar dados financeiros
      const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
      
      if (transactions) {
        const financialSummary = transactions.reduce((acc: any, txn: any) => {
          acc[txn.type] = (acc[txn.type] || 0) + parseFloat(txn.amount)
          return acc
        }, {})

        setFinanceiroData([
          { name: "Entradas", value: financialSummary.entrada || 0, color: "hsl(var(--chart-1))" },
          { name: "Saídas", value: financialSummary.saida || 0, color: "hsl(var(--chart-2))" }
        ])
      }

      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar dados dos relatórios:', error)
      setLoading(false)
    }
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Não mostra label para valores muito pequenos
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho da sua clínica através de gráficos e métricas
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Relatório de Agendamentos */}
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Resultado dos Agendamentos</CardTitle>
            </div>
            <CardDescription>Status dos compromissos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agendamentosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {agendamentosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4 w-full">
              {agendamentosData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relatório de Pacientes */}
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Pacientes</CardTitle>
            </div>
            <CardDescription>Novos vs Antigos</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pacientesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pacientesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-1 gap-2 mt-4 w-full">
              {pacientesData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relatório Financeiro */}
        <Card className="w-full">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Financeiro</CardTitle>
            </div>
            <CardDescription>Receita por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="mb-4 w-full">
              <Select value={periodoFinanceiro} onValueChange={setPeriodoFinanceiro}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diario">Diário</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="bimestral">Bimestral</SelectItem>
                  <SelectItem value="semestral">Semestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={financeiroData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {financeiroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent 
                      formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                    />} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-1 gap-2 mt-4 w-full">
              {financeiroData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    R$ {item.value.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Total */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Período</CardTitle>
          <CardDescription>Métricas consolidadas do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total de Agendamentos</p>
              <p className="text-2xl font-bold">
                {agendamentosData.reduce((acc, item) => acc + item.value, 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Total de Pacientes</p>
              <p className="text-2xl font-bold">
                {pacientesData.reduce((acc, item) => acc + item.value, 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">
                R$ {financeiroData.reduce((acc, item) => acc + item.value, 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;