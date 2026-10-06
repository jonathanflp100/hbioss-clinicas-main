import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Plus, User, ChevronLeft, ChevronRight, X, Edit, RotateCcw, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"


const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const mesesAno = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [formData, setFormData] = useState({
    titulo: "",
    paciente: "",
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: "",
    horario: "",
    data: "",
    tipo: "",
    valor: "",
    isNovoPaciente: true
  })
  const [selectedDate, setSelectedDate] = useState("")
  const [compromissoSelecionado, setCompromissoSelecionado] = useState<any>(null)
  const [buscaPaciente, setBuscaPaciente] = useState("")
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null)
  const [compromissos, setCompromissos] = useState<any[]>([])
  const [pacientesExistentes, setPacientesExistentes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPatients()
    fetchAppointments()
  }, [])

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('status', 'active')
      
      if (error) throw error
      setPacientesExistentes(data || [])
    } catch (error: any) {
      console.error('Erro ao buscar pacientes:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar pacientes",
        variant: "destructive"
      })
    }
  }

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })
      
      if (error) throw error
      
      const formattedData = data?.map(appointment => ({
        id: appointment.id,
        titulo: appointment.title,
        paciente: appointment.patient_name,
        horario: appointment.appointment_time.slice(0, 5), // Remove seconds
        data: appointment.appointment_date,
        tipo: appointment.type,
        status: appointment.status,
        valor: appointment.value
      })) || []
      
      setCompromissos(formattedData)
      setLoading(false)
    } catch (error: any) {
      console.error('Erro ao buscar compromissos:', error)
      setLoading(false)
    }
  }

  const handleAgendar = async () => {
    // Validação de campos obrigatórios
    if (!formData.titulo || !formData.horario || !formData.data || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      })
      return
    }
    
    // Validação de valor (obrigatório exceto para "volta")
    if (formData.tipo !== "volta" && !formData.valor) {
      toast({
        title: "Erro",
        description: "O valor da consulta é obrigatório",
        variant: "destructive"
      })
      return
    }
    
    // Validação de paciente
    if (formData.isNovoPaciente && (!formData.nome || !formData.cpf || !formData.telefone)) {
      toast({
        title: "Erro",
        description: "Preencha os dados do paciente",
        variant: "destructive"
      })
      return
    }
    
    if (!formData.isNovoPaciente && !formData.paciente) {
      toast({
        title: "Erro", 
        description: "Selecione um paciente existente",
        variant: "destructive"
      })
      return
    }
    
    // Verificação de conflito de horário
    const conflito = compromissos.find(c => 
      c.data === formData.data && c.horario === formData.horario
    )
    
    if (conflito) {
      toast({
        title: "Erro",
        description: `Dia ${formData.data.split('-').reverse().join('/')} e hora ${formData.horario} estão ocupados`,
        variant: "destructive"
      })
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      let patientId = null
      let patientName = formData.isNovoPaciente ? formData.nome : formData.paciente

      // Se for novo paciente, criar registro
      if (formData.isNovoPaciente) {
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            user_id: user.id,
            full_name: formData.nome,
            document_number: formData.cpf,
            phone: formData.telefone,
            email: formData.email || null,
            address: formData.endereco || null
          })
          .select()
          .single()

        if (patientError) throw patientError
        patientId = newPatient.id
      } else {
        // Buscar ID do paciente existente
        const selectedPatient = pacientesExistentes.find(p => p.full_name === formData.paciente)
        if (selectedPatient) {
          patientId = selectedPatient.id
        }
      }

      // Criar agendamento
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: user.id,
          patient_id: patientId,
          patient_name: patientName,
          title: formData.titulo,
          appointment_date: formData.data,
          appointment_time: formData.horario + ':00',
          type: formData.tipo,
          value: formData.valor ? parseFloat(formData.valor) : null
        })

      if (appointmentError) throw appointmentError

      toast({
        title: "Sucesso",
        description: "Compromisso agendado com sucesso!"
      })
      
      // Atualizar lista de compromissos
      fetchAppointments()
      
      setFormData({ 
        titulo: "", paciente: "", nome: "", cpf: "", telefone: "", email: "", 
        endereco: "", horario: "", data: "", tipo: "", valor: "", isNovoPaciente: true 
      })
    } catch (error: any) {
      console.error('Erro ao agendar:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao agendar compromisso",
        variant: "destructive"
      })
    }
  }

  const handleConsultarDia = () => {
    if (!selectedDate) {
      toast({
        title: "Erro", 
        description: "Selecione uma data para consultar",
        variant: "destructive"
      })
      return
    }
    
    const compromissosData = compromissos.filter(c => c.data === selectedDate)
    toast({
      title: "Consulta",
      description: `Encontrados ${compromissosData.length} compromisso(s) para ${selectedDate.split('-').reverse().join('/')}`
    })
  }

  const handleCancelar = async (id: string) => {
    if (showCancelConfirm === id) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelado' })
          .eq('id', id)

        if (error) throw error

        toast({
          title: "Sucesso",
          description: "Compromisso cancelado com sucesso!"
        })
        
        fetchAppointments()
        setShowCancelConfirm(null)
      } catch (error: any) {
        console.error('Erro ao cancelar:', error)
        toast({
          title: "Erro",
          description: "Erro ao cancelar compromisso",
          variant: "destructive"
        })
      }
    } else {
      setShowCancelConfirm(id)
    }
  }

  const handleReagendar = async () => {
    if (!compromissoSelecionado || !formData.data || !formData.horario) {
      toast({
        title: "Erro",
        description: "Selecione um compromisso e preencha nova data/horário",
        variant: "destructive"
      })
      return
    }
    
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: formData.data,
          appointment_time: formData.horario + ':00'
        })
        .eq('id', compromissoSelecionado.id)

      if (error) throw error

      toast({
        title: "Sucesso", 
        description: "Compromisso reagendado com sucesso!"
      })
      
      fetchAppointments()
      setCompromissoSelecionado(null)
      setFormData({ 
        titulo: "", paciente: "", nome: "", cpf: "", telefone: "", email: "", 
        endereco: "", horario: "", data: "", tipo: "", valor: "", isNovoPaciente: true 
      })
    } catch (error: any) {
      console.error('Erro ao reagendar:', error)
      toast({
        title: "Erro",
        description: "Erro ao reagendar compromisso",
        variant: "destructive"
      })
    }
  }
  
  const CompromissoItem = ({ compromisso }: { compromisso: any }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
      <div className="text-center min-w-[60px]">
        <div className="text-lg font-bold text-primary">{compromisso.horario}</div>
        <div className="text-xs text-muted-foreground">
          {compromisso.data.split('-').reverse().join('/')}
        </div>
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{compromisso.titulo}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <User className="w-3 h-3" />
          {compromisso.paciente}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge className={
          compromisso.tipo === "primeira_consulta" ? "bg-blue-500/10 text-blue-500" : 
          compromisso.tipo === "volta" ? "bg-green-500/10 text-green-500" :
          "bg-purple-500/10 text-purple-500"
        }>
          {compromisso.tipo === "primeira_consulta" ? "Primeira Consulta" :
           compromisso.tipo === "volta" ? "Volta" : "Procedimento Agendado"}
        </Badge>
        <Badge className={
          compromisso.status === "realizado" ? "bg-green-500/10 text-green-600" : 
          compromisso.status === "faltou" ? "bg-red-500/10 text-red-600" :
          "bg-yellow-500/10 text-yellow-600"
        }>
          {compromisso.status}
        </Badge>
        <div className="flex gap-1">
          {showCancelConfirm === compromisso.id ? (
            <div className="flex gap-1">
              <Button variant="destructive" size="sm" onClick={() => handleCancelar(compromisso.id)}>
                Confirmar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(null)}>
                Cancelar
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => handleCancelar(compromisso.id)}>
                <X className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCompromissoSelecionado(compromisso)}>
                <RotateCcw className="w-3 h-3" />
              </Button>
              {compromisso.status === 'pendente' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={async () => {
                    try {
                      const { data: { user } } = await supabase.auth.getUser()
                      if (!user) throw new Error('Usuário não autenticado')

                      // Marcar como realizado
                      const { error } = await supabase
                        .from('appointments')
                        .update({ status: 'realizado' })
                        .eq('id', compromisso.id)

                      if (error) throw error

                      // Se tem valor, criar transação financeira positiva
                      if (compromisso.valor && compromisso.valor > 0) {
                        const { error: transactionError } = await supabase
                          .from('transactions')
                          .insert({
                            user_id: user.id,
                            patient_id: compromisso.patient_id,
                            patient_name: compromisso.paciente,
                            description: `Consulta realizada - ${compromisso.titulo}`,
                            amount: compromisso.valor,
                            type: 'receita',
                            status: 'confirmado',
                            transaction_date: compromisso.data,
                            category: 'consulta'
                          })

                        if (transactionError) throw transactionError
                      }

                      toast({
                        title: "Sucesso",
                        description: "Consulta marcada como realizada!" + (compromisso.valor ? " Valor adicionado ao financeiro." : "")
                      })
                      
                      fetchAppointments()
                    } catch (error: any) {
                      toast({
                        title: "Erro",
                        description: "Erro ao confirmar consulta",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <Check className="w-3 h-3" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  const ViewDiaria = ({ date, setDate, allAppointments }) => {
  // Função para navegar para o dia anterior ou seguinte
  const navigateDay = (amount) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + amount);
    setDate(newDate);
  };

  // Formata a data para ser mostrada no título (ex: "13 de Agosto, 2025")
  const formattedTitle = new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

  // Verifica se a data selecionada é o dia de hoje
  const isToday = new Date().toDateString() === date.toDateString();
  
  // Formata a data para o formato YYYY-MM-DD para o filtro
  const dateStringForFilter = date.toLocaleDateString('sv');

  // Filtra a lista de compromissos para mostrar apenas os do dia selecionado
  const appointmentsForDay = allAppointments.filter(c => c.data === dateStringForFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigateDay(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">{isToday ? 'Hoje - ' : ''}{formattedTitle}</h3>
          <Button variant="ghost" size="sm" onClick={() => navigateDay(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {appointmentsForDay.length > 0 ? (
        appointmentsForDay.map((compromisso) => (
          <CompromissoItem key={compromisso.id} compromisso={compromisso} />
        ))
      ) : (
        <p className="text-muted-foreground text-center py-4">Nenhum compromisso para este dia.</p>
      )}
    </div>
  );
};

  const ViewSemanal = ({ date, setDate, allAppointments }) => {
  // Função para navegar para a semana anterior ou seguinte
  const navigateWeek = (amount) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + (7 * amount));
    setDate(newDate);
  };

  // Calcular o início e o fim da semana com base na data atual
  const diaDaSemana = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const inicioSemana = new Date(date);
  inicioSemana.setDate(date.getDate() - diaDaSemana);
  inicioSemana.setHours(0, 0, 0, 0);

  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  fimSemana.setHours(23, 59, 59, 999);

  // Formatar o título para mostrar o intervalo da semana
  const formattedTitle = `${new Intl.DateTimeFormat('pt-BR', { day: 'numeric' }).format(inicioSemana)} - ${new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(fimSemana)}`;

  // Filtrar os compromissos para mostrar apenas os da semana selecionada
  const appointmentsForWeek = allAppointments.filter(c => {
    const dataCompromisso = new Date(c.data + 'T00:00:00');
    return dataCompromisso >= inicioSemana && dataCompromisso <= fimSemana;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">{formattedTitle}</h3>
          <Button variant="ghost" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {Array.from({ length: 7 }).map((_, index) => {
          const dia = new Date(inicioSemana);
          dia.setDate(inicioSemana.getDate() + index);
          return (
            <div key={index} className="text-center p-2 border border-border/30 rounded-lg bg-muted/20">
              <div className="text-xs text-muted-foreground">{diasSemana[dia.getDay()]}</div>
              <div className="text-sm font-medium">{dia.getDate()}</div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {appointmentsForWeek.length > 0 ? (
          appointmentsForWeek.map((compromisso) => (
            <CompromissoItem key={compromisso.id} compromisso={compromisso} />
          ))
        ) : (
          <p className="text-muted-foreground text-center py-4">Nenhum compromisso para esta semana.</p>
        )}
      </div>
    </div>
  );
};

 const ViewMensal = ({ date, setDate, allAppointments }) => {
  const hoje = new Date();
  
  const primeiroDiaMes = new Date(date.getFullYear(), date.getMonth(), 1);
  const ultimoDiaMes = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const primeiroDiaSemana = primeiroDiaMes.getDay();
  const diasMes = ultimoDiaMes.getDate();

  const navegarMes = (direcao) => {
    const novoMes = new Date(date.getFullYear(), date.getMonth() + direcao, 1);
    setDate(novoMes);
  };
  
  // Filtra os compromissos apenas para o mês atual
  const appointmentsForMonth = allAppointments.filter(c => {
    const appointmentDate = new Date(c.data + 'T00:00:00');
    return appointmentDate.getFullYear() === date.getFullYear() && appointmentDate.getMonth() === date.getMonth();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navegarMes(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navegarMes(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {diasSemana.map((dia) => (
          <div key={dia} className="text-center p-2 text-xs font-medium text-muted-foreground">{dia}</div>
        ))}
        
        {Array.from({ length: primeiroDiaSemana }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}
        
        {Array.from({ length: diasMes }, (_, i) => i + 1).map((dia) => {
          const dataFormatada = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
          const compromissosDia = appointmentsForMonth.filter(c => c.data === dataFormatada);
          
          const realizados = compromissosDia.filter(c => c.status === "realizado" || c.status === "Confirmado");
          const cancelados = compromissosDia.filter(c => c.status === "cancelado" || c.status === "faltou");
          const pendentes = compromissosDia.filter(c => c.status === "pendente");
          
          const isHoje = hoje.getDate() === dia && hoje.getMonth() === date.getMonth() && hoje.getFullYear() === date.getFullYear();
          
          return (
            <div key={dia} className={`aspect-square p-1 text-sm border border-border/30 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors ${isHoje ? 'bg-primary text-primary-foreground border-primary' : 'bg-card'}`}>
              <div className="w-full h-full flex flex-col items-center justify-center">
                <span className="font-medium">{dia}</span>
                <div className="flex flex-wrap gap-0.5 justify-center items-center pt-1">
                  {realizados.map((_, index) => (<div key={`realizado-${index}`} className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>))}
                  {cancelados.map((_, index) => (<div key={`cancelado-${index}`} className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>))}
                  {pendentes.map((_, index) => (<div key={`pendente-${index}`} className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">Compromissos este mês:</h4>
        {appointmentsForMonth.length > 0 ? (
            appointmentsForMonth.map((compromisso) => (
                <CompromissoItem key={compromisso.id} compromisso={compromisso} />
            ))
        ) : (
            <p className="text-muted-foreground text-sm">Nenhum compromisso para este mês.</p>
        )}
      </div>
    </div>
  );
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus compromissos e reuniões</p>
        </div>
        <div className="flex gap-2">
          {/* Modal Agendar */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Agendar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Título do compromisso"
                  />
                </div>
                
                {/* Seleção de tipo de paciente */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={formData.isNovoPaciente}
                      onChange={() => setFormData({...formData, isNovoPaciente: true, paciente: ""})}
                    />
                    <span>Novo Paciente</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!formData.isNovoPaciente}
                      onChange={() => setFormData({
                        ...formData, 
                        isNovoPaciente: false, 
                        nome: "", cpf: "", telefone: "", email: "", endereco: ""
                      })}
                    />
                    <span>Paciente Existente</span>
                  </label>
                </div>

                {formData.isNovoPaciente ? (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium">Dados do Novo Paciente</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome Completo *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData({...formData, nome: e.target.value})}
                          placeholder="Nome completo do paciente"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <Label htmlFor="telefone">Telefone *</Label>
                        <Input
                          id="telefone"
                          value={formData.telefone}
                          onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="email@dominio.com"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                        placeholder="Endereço completo"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <h4 className="font-medium">Selecionar Paciente Existente</h4>
                    <div>
                      <Label htmlFor="buscaPaciente">Buscar Paciente</Label>
                      <Input
                        id="buscaPaciente"
                        value={buscaPaciente}
                        onChange={(e) => setBuscaPaciente(e.target.value)}
                        placeholder="Digite o nome do paciente..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="paciente">Selecionar Paciente *</Label>
                      <Select value={formData.paciente} onValueChange={(value) => setFormData({...formData, paciente: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {pacientesExistentes
                            .filter(paciente => 
                              (paciente.full_name && paciente.full_name.toLowerCase().includes(buscaPaciente.toLowerCase())) ||
                              (paciente.document_number && paciente.document_number.includes(buscaPaciente))
                            )
                            .map((paciente) => (
                              <SelectItem key={paciente.id} value={paciente.full_name}>
                                {paciente.full_name} - {paciente.document_number || 'Sem CPF'}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input
                      id="data"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario">Horário</Label>
                    <Input
                      id="horario"
                      type="time"
                      value={formData.horario}
                      onChange={(e) => setFormData({...formData, horario: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeira_consulta">Primeira Consulta</SelectItem>
                      <SelectItem value="volta">Volta</SelectItem>
                      <SelectItem value="procedimento_agendado">Procedimento Agendado</SelectItem>
                      <SelectItem value="convenio">Convênio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor da Consulta {formData.tipo !== "volta" && "*"}</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                    disabled={formData.tipo === "volta"}
                  />
                  {formData.tipo === "volta" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Valor não obrigatório para consultas de retorno
                    </p>
                  )}
                </div>
                <Button onClick={handleAgendar} className="w-full">
                  Confirmar Agendamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Consultar Dia */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Consultar Dia
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Consultar Dia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="consultaData">Selecione a Data</Label>
                  <Input
                    id="consultaData"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <Button onClick={handleConsultarDia} className="w-full">
                  Consultar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Re-agendar */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Re-agendar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Re-agendar Compromisso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Buscar Compromisso por Paciente</Label>
                  <Input
                    placeholder="Digite o nome do paciente..."
                    value={buscaPaciente}
                    onChange={(e) => setBuscaPaciente(e.target.value)}
                    className="mb-4"
                  />
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {compromissos
                      .filter(c => c.paciente.toLowerCase().includes(buscaPaciente.toLowerCase()))
                      .map((compromisso) => (
                        <div
                          key={compromisso.id}
                          className={`
                            p-3 border rounded-lg cursor-pointer transition-colors
                            ${compromissoSelecionado?.id === compromisso.id 
                              ? 'bg-primary/10 border-primary' 
                              : 'bg-muted/50 hover:bg-muted/70'
                            }
                          `}
                          onClick={() => setCompromissoSelecionado(compromisso)}
                        >
                          <div className="font-medium">{compromisso.titulo}</div>
                          <div className="text-sm text-muted-foreground">
                            {compromisso.paciente} - {compromisso.data.split('-').reverse().join('/')} às {compromisso.horario}
                          </div>
                        </div>
                      ))
                    }
                    {buscaPaciente && compromissos.filter(c => 
                      c.paciente.toLowerCase().includes(buscaPaciente.toLowerCase())
                    ).length === 0 && (
                      <div className="p-3 text-center text-muted-foreground">
                        Nenhum compromisso encontrado para "{buscaPaciente}"
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label>Compromisso Selecionado</Label>
                  <div className="p-3 border rounded-lg bg-muted/50">
                    {compromissoSelecionado ? 
                      `${compromissoSelecionado.titulo} - ${compromissoSelecionado.paciente}` : 
                      "Busque e selecione um compromisso acima"
                    }
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reagendarData">Nova Data</Label>
                    <Input
                      id="reagendarData"
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({...formData, data: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reagendarHorario">Novo Horário</Label>
                    <Input
                      id="reagendarHorario"
                      type="time"
                      value={formData.horario}
                      onChange={(e) => setFormData({...formData, horario: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleReagendar} className="w-full">
                  Confirmar Reagendamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card className="bg-card-elevated border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Agenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dia" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="dia">Dia</TabsTrigger>
                  <TabsTrigger value="semana">Semana</TabsTrigger>
                  <TabsTrigger value="mes">Mês</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dia">
                  <ViewDiaria date={currentDate} setDate={setCurrentDate} allAppointments={compromissos} />
                </TabsContent>
                
                <TabsContent value="semana">
                  <ViewSemanal date={currentDate} setDate={setCurrentDate} allAppointments={compromissos} />
                </TabsContent>
                
                <TabsContent value="mes">
                  <ViewMensal date={currentDate} setDate={setCurrentDate} allAppointments={compromissos} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="bg-card-elevated border-border/50">
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
           <CardContent className="space-y-4">
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Hoje</span>
    <span className="font-semibold text-foreground">
      {(() => {
        const hojeString = new Date().toLocaleDateString('sv'); // Formato YYYY-MM-DD
        return compromissos.filter(c => c.data === hojeString).length;
      })()}
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">Esta semana</span>
    <span className="font-semibold text-primary">
      {(() => {
        const hoje = new Date();
        const diaDaSemana = hoje.getDay();
        const inicioSemana = new Date(hoje.setDate(hoje.getDate() - diaDaSemana));
        const fimSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 6));
        
        inicioSemana.setHours(0, 0, 0, 0);
        fimSemana.setHours(23, 59, 59, 999);
        
        return compromissos.filter(c => {
          const dataCompromisso = new Date(c.data + 'T00:00:00');
          return dataCompromisso >= inicioSemana && dataCompromisso <= fimSemana;
        }).length;
      })()}
    </span>
  </div>
  <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Confirmados</span>
      <span className="font-semibold text-success">
          {compromissos.filter(c => c.status === 'Confirmado' || c.status === 'realizado').length}
      </span>
  </div>
  <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">Pendentes</span>
      <span className="font-semibold text-warning">
          {compromissos.filter(c => c.status === 'pendente').length}
      </span>
  </div>
</CardContent>
          </Card>

          {/* Next Appointment */}
          <Card className="bg-card-elevated border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Próximo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const agora = new Date();
                const proximoCompromisso = compromissos
    .map(c => ({
        ...c,
        // Cria uma data completa para comparação
        dataHora: new Date(`${c.data}T${c.horario}`)
    }))
    .filter(c => c.dataHora > new Date()) // Filtra apenas os compromissos futuros
    .sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime())[0]; // Ordena e pega o primeiro

                if (!proximoCompromisso) {
                  return (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Nenhum compromisso agendado</p>
                    </div>
                  );
                }

                const dataFormatada = new Date(proximoCompromisso.appointment_date).toLocaleDateString('pt-BR');
                
                return (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">Consulta com {proximoCompromisso.patient_name}</h3>
                    <p className="text-sm text-muted-foreground">{proximoCompromisso.appointment_time} - {dataFormatada}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        toast({
                          title: "Consulta iniciada",
                          description: "Compromisso marcado como realizado",
                        })
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Iniciar Consulta
                    </Button>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}