import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, QrCode, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppConnectionModal } from "@/components/whatsapp/WhatsAppConnectionModal";
import io, { Socket } from "socket.io-client";
import type { Chat, Message } from "whatsapp-web.js";

export default function WhatsApp() {
  const [mensagem, setMensagem] = useState("");
  const [conversaSelecionada, setConversaSelecionada] = useState<Chat | null>(null);
  const [conversas, setConversas] = useState<Chat[]>([]);
  const [mensagens, setMensagens] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { toast } = useToast();
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Efeito para rolar para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on('qr', (qr: string) => {
      setQrCode(qr);
      setIsConnected(false);
      setShowConnectionModal(true);
    });

    socket.on('ready', () => {
      setIsConnected(true);
      setQrCode(null);
      setShowConnectionModal(false);
      toast({ title: "WhatsApp Conectado", description: "Sincronizando suas conversas." });
      setTimeout(() => socket.emit('get-chats'), 1000);
    });

    socket.on('chats', (chats: Chat[]) => setConversas(chats));

    socket.on('message', (message: Message) => {
      if (conversaSelecionada && (message.from === conversaSelecionada.id._serialized || message.to === conversaSelecionada.id._serialized)) {
        setMensagens(prev => [...prev, message]);
      }
      setTimeout(() => socket.emit('get-chats'), 500);
    });

    socket.on('messages', (messages: Message[]) => {
      setMensagens(messages);
      setLoadingMessages(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [conversaSelecionada, toast]);

  const handleSelecionarConversa = (chat: Chat) => {
    setConversaSelecionada(chat);
    setMensagens([]);
    setLoadingMessages(true);
    socketRef.current?.emit('get-messages', { chatId: chat.id._serialized });
  };

  const handleEnviarMensagem = () => {
    if (!mensagem.trim() || !conversaSelecionada || !socketRef.current) return;

    const novaMensagem = { to: conversaSelecionada.id._serialized, body: mensagem };
    socketRef.current.emit('send-message', novaMensagem);

    setMensagens(prev => [...prev, { fromMe: true, body: mensagem, timestamp: Date.now() / 1000 } as unknown as Message]);
    setMensagem("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp</h1>
          <p className="text-muted-foreground">Gerencie suas conversas e envie mensagens</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
            <span className={`font-medium ${isConnected ? 'text-green-500' : 'text-red-500'}`}>{isConnected ? "Conectado" : "Desconectado"}</span>
          </div>
          <Button onClick={() => setShowConnectionModal(true)}><QrCode className="w-4 h-4 mr-2" />Conectar WhatsApp</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 flex flex-col h-[calc(100vh-200px)]">
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare />Conversas</CardTitle></CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {conversas.length > 0 ? conversas.map((chat) => (
              <div key={chat.id._serialized} onClick={() => handleSelecionarConversa(chat)} className={`p-3 cursor-pointer hover:bg-muted/50 border-l-2 ${conversaSelecionada?.id._serialized === chat.id._serialized ? "border-primary bg-muted" : "border-transparent"}`}>
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold truncate text-sm">{chat.name}</h4>
                  {chat.unreadCount > 0 && <Badge className="bg-primary h-5 w-5 p-0 flex items-center justify-center text-xs">{chat.unreadCount}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage?.body}</p>
              </div>
            )) : <div className="p-4 text-center text-muted-foreground">Nenhuma conversa encontrada.</div>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-200px)]">
          {conversaSelecionada ? (
            <>
              <CardHeader className="border-b"><h3 className="font-semibold">{conversaSelecionada.name || 'Nome não disponível'}</h3></CardHeader>
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {loadingMessages ? (<div className="flex items-center justify-center h-full text-muted-foreground">A carregar mensagens...</div>
                ) : (
                  mensagens.map((msg, index) => (
                    <div key={index} className={`flex ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-lg p-3 rounded-lg ${msg.fromMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}><p>{msg.body}</p></div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              <div className="p-4 border-t mt-auto">
                <div className="flex gap-2">
                  <Textarea placeholder="Digite sua mensagem..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); handleEnviarMensagem();}}} className="resize-none" />
                  <Button onClick={handleEnviarMensagem} disabled={!mensagem.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Selecione uma conversa</h3>
              </div>
            </div>
          )}
        </Card>
      </div>

      <WhatsAppConnectionModal open={showConnectionModal} onOpenChange={setShowConnectionModal} qrCode={qrCode} isConnected={isConnected} />
    </div>
  );
}