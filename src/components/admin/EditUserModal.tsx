import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  } | null;
  onUserUpdated?: () => void;
}

export function EditUserModal({ open, onOpenChange, user, onUserUpdated }: EditUserModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    avatar_url: "",
    phone: "",
    birth_date: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    document_number: "",
    profession: "",
    department: "",
    status: "active",
    notes: "",
    role: "user",
    module_agenda: true,
    module_financeiro: true,
    module_whatsapp: true,
    module_iachat: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Buscar dados completos do perfil
      const fetchUserProfile = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (error) {
          console.error('Erro ao buscar perfil:', error)
          return
        }
        
        setFormData({
          full_name: user.full_name || "",
          email: user.email,
          avatar_url: profile?.avatar_url || "",
          phone: profile?.phone || "",
          birth_date: profile?.birth_date || "",
          address: profile?.address || "",
          city: profile?.city || "",
          state: profile?.state || "",
          zip_code: profile?.zip_code || "",
          document_number: profile?.document_number || "",
          profession: profile?.profession || "",
          department: profile?.department || "",
          status: profile?.status || "active",
          notes: profile?.notes || "",
          role: user.role,
          module_agenda: profile?.module_agenda ?? true,
          module_financeiro: profile?.module_financeiro ?? true,
          module_whatsapp: profile?.module_whatsapp ?? true,
          module_iachat: profile?.module_iachat ?? true
        });
      };
      
      fetchUserProfile();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update profile
      console.log('Updating profile with modules:', {
        module_agenda: formData.module_agenda,
        module_financeiro: formData.module_financeiro,
        module_whatsapp: formData.module_whatsapp,
        module_iachat: formData.module_iachat
      })

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          email: formData.email,
          avatar_url: formData.avatar_url,
          phone: formData.phone,
          birth_date: formData.birth_date || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          document_number: formData.document_number,
          profession: formData.profession,
          department: formData.department,
          status: formData.status,
          notes: formData.notes,
          module_agenda: formData.module_agenda,
          module_financeiro: formData.module_financeiro,
          module_whatsapp: formData.module_whatsapp,
          module_iachat: formData.module_iachat
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update role
      const { error: roleError } = await supabase
        .from('user_roles')
        .update({ role: formData.role as 'user' | 'admin' })
        .eq('user_id', user.id);

      if (roleError) throw roleError;

      toast({
        title: "Usuário atualizado",
        description: "Os dados do usuário foram atualizados com sucesso.",
      });

      // Refresh the current user's profile if editing own profile
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser && currentUser.id === user.id) {
        // Force refresh by triggering a profile update event
        window.dispatchEvent(new CustomEvent('profile-updated'));
      }

      onUserUpdated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar o usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Usuário - {user?.full_name || user?.email}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básicos</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="professional">Profissional</TabsTrigger>
              <TabsTrigger value="modules">Módulos</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Digite o email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="document_number">CPF/CNPJ</Label>
                  <Input
                    id="document_number"
                    value={formData.document_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, document_number: e.target.value }))}
                    placeholder="Digite o CPF ou CNPJ"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">Data de Nascimento</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar_url">URL do Avatar</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="Digite a URL do avatar"
                />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    id="zip_code"
                    value={formData.zip_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="SP, RJ, MG..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="professional" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profession">Profissão</Label>
                  <Input
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    placeholder="Ex: Médico, Advogado, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Ex: Vendas, Marketing, etc."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4 mt-4">
              <div className="text-sm text-muted-foreground mb-4">
                Controle quais módulos estarão disponíveis para este usuário. Dashboard, Relatórios e Pacientes estão sempre ativos.
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="module_agenda" className="font-medium">Agenda</Label>
                    <p className="text-sm text-muted-foreground">Acesso ao módulo de agendamento</p>
                  </div>
                  <Switch
                    id="module_agenda"
                    checked={formData.module_agenda}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, module_agenda: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="module_financeiro" className="font-medium">Financeiro</Label>
                    <p className="text-sm text-muted-foreground">Acesso ao módulo financeiro</p>
                  </div>
                  <Switch
                    id="module_financeiro"
                    checked={formData.module_financeiro}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, module_financeiro: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="module_whatsapp" className="font-medium">WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Acesso ao módulo WhatsApp</p>
                  </div>
                  <Switch
                    id="module_whatsapp"
                    checked={formData.module_whatsapp}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, module_whatsapp: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label htmlFor="module_iachat" className="font-medium">IA Chat</Label>
                    <p className="text-sm text-muted-foreground">Acesso ao módulo de chat com IA</p>
                  </div>
                  <Switch
                    id="module_iachat"
                    checked={formData.module_iachat}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, module_iachat: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Perfil de Acesso</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o perfil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status da Conta</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações Administrativas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais sobre o usuário..."
                  rows={4}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}