import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080", // Porta correta do seu frontend
    methods: ["GET", "POST"]
  }
});

console.log("Servidor iniciado. A inicializar cliente WhatsApp...");

// Usar LocalAuth para guardar a sessão e não precisar de ler o QR Code sempre
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr: string) => {
  console.log('QR Code recebido! Leia com o seu telemóvel.');
  qrcode.generate(qr, { small: true });
  io.emit('qr', qr);
});

client.on('ready', () => {
  console.log('Cliente WhatsApp está pronto!');
  io.emit('ready');
});

client.on('message', (message: Message) => {
  console.log(`Mensagem recebida de ${message.from}: ${message.body}`);
  io.emit('message', message); 
});

client.initialize();

io.on('connection', (socket: Socket) => {
  console.log('Frontend conectado via Socket.IO');

  socket.on('get-chats', async () => {
    try {
      console.log('Backend: A receber pedido "get-chats". A buscar conversas...');
      const chats = await client.getChats();
      console.log(`Backend: ${chats.length} conversas encontradas. A enviar para o frontend.`);
      socket.emit('chats', chats.filter(chat => !chat.isGroup));
    } catch (error) {
      console.error("Backend: Erro ao buscar conversas:", error);
    }
  });

  socket.on('get-messages', async ({ chatId }: { chatId: string }) => {
    try {
      const chat = await client.getChatById(chatId);
      const messages = await chat.fetchMessages({ limit: 50 }); 
      socket.emit('messages', messages);
    } catch (error) {
      console.error(`Erro ao buscar mensagens para ${chatId}:`, error);
    }
  });

  socket.on('send-message', async ({ to, body }: { to: string, body: string }) => {
    try {
      const chatId = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
      await client.sendMessage(chatId, body);
      console.log(`Mensagem enviada para ${chatId}: ${body}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Frontend desconectado');
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Servidor de WhatsApp a correr na porta ${PORT}`));