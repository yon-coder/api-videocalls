import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AccessToken, WebhookReceiver } from 'livekit-server-sdk';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

// --- ROTA 1: GERAÇÃO DE TOKEN (HIERARQUIA) ---
app.post('/getToken', async (req, res) => {
  const { roomName, participantName, role } = req.body; // role: 'prof' ou 'aluno'

  if (!roomName || !participantName) {
    return res.status(400).json({ error: 'Dados insuficientes' });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: participantName }
  );

  const isProf = role === 'prof';

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: isProf,      // só professor começa com permissao de transmissão
    canPublishData: true,    // chat liberado para ambos
    canSubscribe: true,      // ver/Ouvir liberado
    roomAdmin: isProf,      
  });

  res.json({ token: await at.toJwt() });
});

// --- ROTA 2: WEBHOOK DE PRESENÇA ---
app.post('/webhooks/livekit', async (req, res) => {
  try {
    const event = receiver.receive(req.body, req.get('Authorization'));

    switch (event.event) {
      case 'participant_joined':
        console.log(`[PRESENÇA] Aluno ${event.participant?.identity} entrou na sala ${event.room?.name}`);
        //inserir a lógica de Banco de Dados (ex: db.presence.create(...))
        break;

      case 'participant_left':
        console.log(`[PRESENÇA] Aluno ${event.participant?.identity} saiu da sala.`);
        //atualize o registro com o horário de saída
        break;
    }

    res.send('ok');
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(400).send('Assinatura inválida');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API de Videochamada rodando na porta ${PORT}`);
});