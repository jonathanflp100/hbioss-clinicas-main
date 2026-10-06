import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Eye, EyeOff, Instagram, Loader2 } from "lucide-react";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Perfil() {
  const { t } = useLanguage();
  const { profile, loading } = useUserProfile();
  const [showPassword, setShowPassword] = useState(false);

  const userData = profile ? {
    image: profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || profile.email)}&size=150`,
    usuario: profile.email.split('@')[0],
    email: profile.email,
    senha: "********",
    nomeCompleto: profile.full_name || profile.email,
    dataNascimento: profile.birth_date || "",
    sexo: "",
    telefone: profile.phone || "",
    endereco: {
      rua: profile.address || "",
      numero: "",
      cidade: profile.city || "",
      estado: profile.state || "",
      cep: profile.zip_code || ""
    },
    profissao: profile.profession || "",
    outroDocumento: profile.document_number || "",
    instagram: "",
    cadastradoEm: profile.created_at,
    status: profile.status === 'active' ? 'Ativo' : 'Inativo'
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Erro ao carregar perfil do usuário</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground">Visualize e gerencie suas informações pessoais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={userData.image} alt={userData.nomeCompleto} />
                <AvatarFallback className="text-2xl">
                  {userData.nomeCompleto.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{userData.nomeCompleto}</CardTitle>
              <CardDescription>@{userData.usuario}</CardDescription>
              <Badge variant={userData.status === "Ativo" ? "default" : "secondary"} className="w-fit mx-auto">
                {userData.status}
              </Badge>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Cadastrado em {new Date(userData.cadastradoEm).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{userData.profissao || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{userData.instagram || "Não informado"}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usuario">Usuário</Label>
                  <Input id="usuario" value={userData.usuario} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={userData.email} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input 
                      id="senha" 
                      type={showPassword ? "text" : "password"} 
                      value={userData.senha} 
                      readOnly 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeCompleto">Nome Completo</Label>
                  <Input id="nomeCompleto" value={userData.nomeCompleto} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input 
                    id="dataNascimento" 
                    value={userData.dataNascimento ? new Date(userData.dataNascimento).toLocaleDateString('pt-BR') : "Não informado"} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sexo">Sexo</Label>
                  <Input id="sexo" value={userData.sexo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value={userData.telefone} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profissao">Profissão</Label>
                  <Input id="profissao" value={userData.profissao} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documento">Outro Documento</Label>
                  <Input id="documento" value={userData.outroDocumento} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereço Completo</Label>
                  <Input 
                    id="endereco" 
                    value={`${userData.endereco.rua}, ${userData.endereco.numero}, ${userData.endereco.cidade} - ${userData.endereco.estado}`} 
                    readOnly 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" value={userData.endereco.cidade} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input id="estado" value={userData.endereco.estado} readOnly />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Redes Sociais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={userData.instagram} readOnly />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}