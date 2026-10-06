import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Users, 
  Settings, 
  Database, 
  Shield, 
  Activity,
  TrendingUp,
  Server
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { AddUserModal } from "./AddUserModal";
import { EditUserModal } from "./EditUserModal";
import { ConfigureN8NModal } from "./ConfigureN8NModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showN8NModal, setShowN8NModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string, email: string} | null>(null);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
  } | null>(null);
  const [users, setUsers] = useState<Array<{
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => {
        const userRole = userRoles?.find(role => role.user_id === profile.user_id);
        return {
          id: profile.user_id,
          email: profile.email,
          full_name: profile.full_name,
          role: userRole?.role || 'user',
          created_at: profile.created_at
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleManageUser = async (user: any) => {
    try {
      // Toggle role between user and admin
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado",
        description: `${user.full_name || user.email} agora é ${newRole}`,
      });

      // Refresh users list
      await fetchUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar o usuário",
        variant: "destructive"
      });
    }
  };

  const systemMetrics = [
    { label: "Total Usuários", value: users.length.toString(), change: "+0", icon: Building2 },
    { label: "Usuários Ativos", value: users.filter(u => u.role !== 'inactive').length.toString(), change: "+0", icon: Users },
    { label: "System Uptime", value: "99.9%", change: "+0.1%", icon: Server },
    { label: "Administradores", value: users.filter(u => u.role === 'admin').length.toString(), change: "+0", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold">HBIOSS Admin</h1>
              <p className="text-sm text-muted-foreground">{t("saas.adminPanel")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">{t("common.admin")}</Badge>
            <Button variant="outline" onClick={onLogout}>
              {t("common.logout")}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.label}
                </CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{metric.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="tenants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tenants">{t("saas.tenantManagement")}</TabsTrigger>
            <TabsTrigger value="users">Relatório de Uso</TabsTrigger>
            <TabsTrigger value="integrations">Integrações N8N</TabsTrigger>
            <TabsTrigger value="settings">{t("saas.systemSettings")}</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {t("saas.tenantManagement")}
                  </CardTitle>
                  <CardDescription>
                    Gerencie todos os usuários e suas configurações
                  </CardDescription>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setShowAddUserModal(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {t("saas.addUser")}
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Carregando usuários...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{user.full_name || user.email}</h4>
                            <p className="text-sm text-muted-foreground">
                              {user.email} • {user.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setShowEditUserModal(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleManageUser(user)}
                          >
                            Gerenciar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Relatório de Uso dos Usuários
                </CardTitle>
                <CardDescription>
                  Monitore o uso e atividade de cada usuário (inquilino)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Carregando relatórios...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium">{user.full_name || user.email}</h4>
                              <p className="text-sm text-muted-foreground">Cadastrado em {new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="font-semibold text-lg">-</div>
                            <div className="text-muted-foreground">Logins/mês</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="font-semibold text-lg">-</div>
                            <div className="text-muted-foreground">Tempo ativo</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="font-semibold text-lg">-</div>
                            <div className="text-muted-foreground">Ações realizadas</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 rounded-lg">
                            <div className="font-semibold text-lg">-</div>
                            <div className="text-muted-foreground">Storage usado</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Integrações N8N por Usuário
                </CardTitle>
                <CardDescription>
                  Configure fluxos N8N individuais para cada usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4">Carregando integrações...</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{user.full_name || user.email}</h4>
                            <p className="text-sm text-muted-foreground">
                              Fluxo N8N: Não configurado
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Inativo
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedUser({ 
                                id: user.id, 
                                name: user.full_name || user.email,
                                email: user.email 
                              });
                              setShowN8NModal(true);
                            }}
                          >
                            Configurar N8N
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t("saas.systemSettings")}
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Security Settings</h4>
                        <p className="text-sm text-muted-foreground">Configure authentication and security policies</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Database Management</h4>
                        <p className="text-sm text-muted-foreground">Monitor and manage database connections</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <h4 className="font-medium">Analytics & Reporting</h4>
                        <p className="text-sm text-muted-foreground">System-wide analytics and reporting settings</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <AddUserModal 
        open={showAddUserModal} 
        onOpenChange={setShowAddUserModal}
        onUserAdded={fetchUsers}
      />
      
      <EditUserModal 
        open={showEditUserModal}
        onOpenChange={setShowEditUserModal}
        user={editingUser}
        onUserUpdated={fetchUsers}
      />
      
      {selectedUser && (
        <ConfigureN8NModal 
          open={showN8NModal} 
          onOpenChange={setShowN8NModal}
          userName={selectedUser.name}
          userId={selectedUser.id}
        />
      )}
    </div>
  );
}