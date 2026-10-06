import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { LanguageSelector } from "./LanguageSelector"
import { Bell, Search, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/hooks/useLanguage"
import { WhatsAppConnectionModal } from "@/components/whatsapp/WhatsAppConnectionModal"
import { useNavigate } from "react-router-dom"

interface AppLayoutProps {
  children: React.ReactNode
  onLogout: () => void
  tenant?: string
}

export function AppLayout({ children, onLogout, tenant }: AppLayoutProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [whatsappConnected, setWhatsappConnected] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const handleWhatsAppClick = () => {
    if (!whatsappConnected) {
      setShowWhatsAppModal(true);
    } else {
      // Se já conectado, navegar para a página do WhatsApp
      navigate('/whatsapp');
    }
  };

  const handleProfileClick = () => {
    navigate('/perfil');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar pacientes, compromissos..." 
                  className="pl-10 w-64 bg-muted/50"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {tenant && (
                <Badge variant="outline" className="hidden sm:flex">
                  {tenant}
                </Badge>
              )}
              
              <LanguageSelector />
              
              {/* WhatsApp Status */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={handleWhatsAppClick}
                title={whatsappConnected ? t("whatsapp.connected") : t("whatsapp.disconnected")}
              >
                <MessageCircle className={`w-4 h-4 ${whatsappConnected ? 'text-green-500' : 'text-red-500'}`} />
                {whatsappConnected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </Button>
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleProfileClick}>
                    {t("common.profile")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                    {t("common.settings")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout}>
                    {t("common.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-background">
            {children}
          </main>
        </div>
      </div>
      
      {/* WhatsApp Connection Modal */}
      <WhatsAppConnectionModal 
        open={showWhatsAppModal} 
        onOpenChange={setShowWhatsAppModal}
        onConnected={() => {
          setWhatsappConnected(true);
          setShowWhatsAppModal(false);
          navigate('/whatsapp');
        }}
      />
    </SidebarProvider>
  )
}