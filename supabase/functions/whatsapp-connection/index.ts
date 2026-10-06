import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppSession {
  qrCode?: string;
  status: 'qr_code' | 'connected' | 'disconnected' | 'ready';
  sessionId: string;
}

// Store sessions in memory (for demo purposes)
const sessions = new Map<string, WhatsAppSession>();

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    if (path.includes('/generate-qr')) {
      // Generate a new QR code session
      const sessionId = crypto.randomUUID();
      
      // Generate a proper WhatsApp Web QR code format
      // Creating a base64 encoded data that simulates WhatsApp's format
      const timestamp = Date.now();
      const ref = Math.random().toString(36).substring(2, 15);
      const secret = crypto.randomUUID().replace(/-/g, '').substring(0, 43);
      const advId = crypto.randomUUID().replace(/-/g, '').substring(0, 22);
      
      // WhatsApp QR code typically contains: ref,secret,advId,version
      const qrData = `${ref},${secret},${advId}==,2`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&format=png&data=${encodeURIComponent(qrData)}`;
      
      const session: WhatsAppSession = {
        qrCode: qrCodeUrl,
        status: 'qr_code',
        sessionId: sessionId
      };
      
      sessions.set(sessionId, session);
      
      console.log(`Generated QR session: ${sessionId}`);
      
      return new Response(
        JSON.stringify({
          sessionId,
          qrCode: qrCodeUrl,
          status: 'qr_code'
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    if (path.includes('/check-status')) {
      const sessionId = url.searchParams.get('sessionId');
      
      if (!sessionId) {
        return new Response(
          JSON.stringify({ error: 'SessionId required' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      
      const session = sessions.get(sessionId);
      
      if (!session) {
        return new Response(
          JSON.stringify({ error: 'Session not found' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      
      // Simulate connection after 10 seconds (for demo)
      const now = Date.now();
      const sessionTime = parseInt(sessionId.substring(0, 8), 16) * 1000;
      
      if (now - sessionTime > 10000) {
        session.status = 'connected';
        sessions.set(sessionId, session);
      }
      
      console.log(`Checking status for session: ${sessionId}, status: ${session.status}`);
      
      return new Response(
        JSON.stringify({
          sessionId,
          status: session.status,
          qrCode: session.qrCode
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    if (path.includes('/send-message')) {
      const { sessionId, to, message } = await req.json();
      
      const session = sessions.get(sessionId);
      
      if (!session || session.status !== 'connected') {
        return new Response(
          JSON.stringify({ error: 'WhatsApp not connected' }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          }
        );
      }
      
      // In a real implementation, you would send the message via WhatsApp API
      console.log(`Sending message to ${to}: ${message}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          messageId: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
    
  } catch (error: any) {
    console.error('Error in WhatsApp connection function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});