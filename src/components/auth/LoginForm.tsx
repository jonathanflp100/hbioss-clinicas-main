import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (userType: 'admin' | 'user', tenant?: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenant, setTenant] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (userType: 'admin' | 'user') => {
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha email e senha",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password
        });
      }

      if (result.error) {
        toast({
          title: "Erro de autenticação",
          description: result.error.message,
          variant: "destructive"
        });
        return;
      }

      if (isSignUp && !result.data.session) {
        toast({
          title: "Conta criada!",
          description: "Verifique seu email para confirmar a conta",
        });
        return;
      }

      // Check user role
      if (result.data.session) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', result.data.session.user.id)
          .single();

        if (userType === 'admin' && roleData?.role !== 'admin') {
          await supabase.auth.signOut();
          toast({
            title: "Acesso negado",
            description: "Você não tem permissões de administrador",
            variant: "destructive"
          });
          return;
        }

        onLogin(roleData?.role === 'admin' ? 'admin' : 'user', tenant || 'main-tenant');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-2xl flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            HBIOSS
          </CardTitle>
          <CardDescription>Business CRM Platform</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="user" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">{t("auth.userAccess")}</TabsTrigger>
              <TabsTrigger value="admin">{t("auth.adminAccess")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder={t("saas.user")}
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t("auth.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('user')}
                  disabled={isLoading}
                >
                  {isLoading ? "Aguarde..." : (isSignUp ? "Criar Conta" : t("auth.login"))}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={isLoading}
                >
                  {isSignUp ? "Já tem conta? Entrar" : "Criar nova conta"}
                </Button>
              </div>
            </TabsContent>
            {/* BOTÃO DE TESTE TEMPORÁRIO */}
<Button
  variant="destructive"
  className="w-full mt-4"
  onClick={async () => {
    console.log("A testar registo...");
    const { data, error } = await supabase.auth.signUp({
      // Nova linha
email: `teste-${Math.floor(Math.random() * 10000)}@gmail.com`,
      password: "Password12345",
    });
    if (error) {
      console.error("Erro no registo de teste:", error);
      alert(`Ocorreu um erro: ${error.message}`);
    } else {
      console.log("Utilizador de teste criado:", data);
      alert("Utilizador de teste criado com sucesso! Verifica a tua lista de Users no Supabase.");
    }
  }}
>
  Teste de Registo Direto
</Button>
            <TabsContent value="admin" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder={t("auth.email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t("auth.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full" 
                  onClick={() => handleAuth('admin')}
                  disabled={isLoading}
                >
                  {isLoading ? "Aguarde..." : (isSignUp ? "Criar Conta Admin" : t("auth.login"))}
                </Button>
                <Button 
                  variant="outline"
                  className="w-full" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  disabled={isLoading}
                >
                  {isSignUp ? "Já tem conta? Entrar" : "Criar nova conta"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}