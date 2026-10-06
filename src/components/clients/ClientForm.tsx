import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Camera, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const clientSchema = z.object({
  foto: z.string().optional(),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  dataNascimento: z.date({ required_error: "Data de nascimento é obrigatória" }),
  telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido (formato: 000.000.000-00)"),
  etiqueta: z.string().min(1, "Selecione uma etiqueta"),
  sexo: z.enum(["masculino", "feminino"], { required_error: "Selecione o sexo" }),
  endereco: z.object({
    avenida: z.string().min(1, "Avenida/Rua é obrigatória"),
    numero: z.string().min(1, "Número é obrigatório"),
    cidade: z.string().min(1, "Cidade é obrigatória"),
    estado: z.string().min(2, "Estado é obrigatório"),
  }),
  primeiraQueixa: z.string().min(10, "Primeira queixa deve ter pelo menos 10 caracteres"),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void
  onCancel: () => void
}

export function ClientForm({ onSubmit, onCancel }: ClientFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string>("")
  const { toast } = useToast()

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      endereco: {
        avenida: "",
        numero: "",
        cidade: "",
        estado: "",
      },
    },
  })

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPhotoPreview(result)
        form.setValue("foto", result)
      }
      reader.readAsDataURL(file)
    }
  }

  const formatCPF = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    const formattedValue = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    return formattedValue
  }

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, "")
    const formattedValue = cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    return formattedValue
  }

  const handleSubmit = (data: ClientFormData) => {
    onSubmit(data)
    toast({
      title: "Paciente cadastrado",
      description: "Paciente foi cadastrado com sucesso!",
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {/* Foto */}
      <div className="flex flex-col items-center space-y-4">
        <Label>Foto do Paciente</Label>
        <div className="relative">
          <Avatar className="w-24 h-24">
            <AvatarImage src={photoPreview} />
            <AvatarFallback className="bg-muted">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="photo-upload"
            className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            {...form.register("nome")}
            className={form.formState.errors.nome ? "border-destructive" : ""}
          />
          {form.formState.errors.nome && (
            <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className={form.formState.errors.email ? "border-destructive" : ""}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        {/* Data de Nascimento */}
        <div className="space-y-2">
          <Label>Data de Nascimento *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !form.watch("dataNascimento") && "text-muted-foreground",
                  form.formState.errors.dataNascimento && "border-destructive"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch("dataNascimento") ? (
                  format(form.watch("dataNascimento"), "dd/MM/yyyy")
                ) : (
                  <span>Selecione a data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={form.watch("dataNascimento")}
                onSelect={(date) => form.setValue("dataNascimento", date!)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          {form.formState.errors.dataNascimento && (
            <p className="text-sm text-destructive">{form.formState.errors.dataNascimento.message}</p>
          )}
        </div>

        {/* Telefone */}
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            {...form.register("telefone")}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value)
              form.setValue("telefone", formatted)
            }}
            placeholder="(11) 99999-9999"
            className={form.formState.errors.telefone ? "border-destructive" : ""}
          />
          {form.formState.errors.telefone && (
            <p className="text-sm text-destructive">{form.formState.errors.telefone.message}</p>
          )}
        </div>

        {/* CPF */}
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF *</Label>
          <Input
            id="cpf"
            {...form.register("cpf")}
            onChange={(e) => {
              const formatted = formatCPF(e.target.value)
              form.setValue("cpf", formatted)
            }}
            placeholder="000.000.000-00"
            className={form.formState.errors.cpf ? "border-destructive" : ""}
          />
          {form.formState.errors.cpf && (
            <p className="text-sm text-destructive">{form.formState.errors.cpf.message}</p>
          )}
        </div>

        {/* Etiqueta */}
        <div className="space-y-2">
          <Label>Origem do Paciente *</Label>
          <Select onValueChange={(value) => form.setValue("etiqueta", value)}>
            <SelectTrigger className={form.formState.errors.etiqueta ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione a origem" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indicacao">Indicação</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="google">Google</SelectItem>
              <SelectItem value="site">Site</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="outros">Outros</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.etiqueta && (
            <p className="text-sm text-destructive">{form.formState.errors.etiqueta.message}</p>
          )}
        </div>

        {/* Sexo */}
        <div className="space-y-2">
          <Label>Sexo *</Label>
          <Select onValueChange={(value) => form.setValue("sexo", value as "masculino" | "feminino")}>
            <SelectTrigger className={form.formState.errors.sexo ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione o sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="masculino">Masculino</SelectItem>
              <SelectItem value="feminino">Feminino</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.sexo && (
            <p className="text-sm text-destructive">{form.formState.errors.sexo.message}</p>
          )}
        </div>
      </div>

      {/* Endereço */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avenida">Avenida/Rua *</Label>
              <Input
                id="avenida"
                {...form.register("endereco.avenida")}
                className={form.formState.errors.endereco?.avenida ? "border-destructive" : ""}
              />
              {form.formState.errors.endereco?.avenida && (
                <p className="text-sm text-destructive">{form.formState.errors.endereco.avenida.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero">Número *</Label>
              <Input
                id="numero"
                {...form.register("endereco.numero")}
                className={form.formState.errors.endereco?.numero ? "border-destructive" : ""}
              />
              {form.formState.errors.endereco?.numero && (
                <p className="text-sm text-destructive">{form.formState.errors.endereco.numero.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade *</Label>
              <Input
                id="cidade"
                {...form.register("endereco.cidade")}
                className={form.formState.errors.endereco?.cidade ? "border-destructive" : ""}
              />
              {form.formState.errors.endereco?.cidade && (
                <p className="text-sm text-destructive">{form.formState.errors.endereco.cidade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                {...form.register("endereco.estado")}
                placeholder="Ex: SP"
                className={form.formState.errors.endereco?.estado ? "border-destructive" : ""}
              />
              {form.formState.errors.endereco?.estado && (
                <p className="text-sm text-destructive">{form.formState.errors.endereco.estado.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Primeira Queixa */}
      <div className="space-y-2">
        <Label htmlFor="primeiraQueixa">Primeira Queixa *</Label>
        <Textarea
          id="primeiraQueixa"
          {...form.register("primeiraQueixa")}
          placeholder="Descreva a primeira queixa ou motivo da consulta..."
          rows={4}
          className={form.formState.errors.primeiraQueixa ? "border-destructive" : ""}
        />
        {form.formState.errors.primeiraQueixa && (
          <p className="text-sm text-destructive">{form.formState.errors.primeiraQueixa.message}</p>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-4 pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-primary text-white hover:opacity-90">
          Cadastrar Paciente
        </Button>
      </div>
    </form>
  )
}