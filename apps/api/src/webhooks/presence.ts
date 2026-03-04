import { WebhookReceiver } from 'livekit-server-sdk';

const receiver = new WebhookReceiver(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!);

export const handleWebhook = async (req: any, res: any) => {
  try {
    const event = receiver.receive(req.body, req.get('Authorization'));
    
    //registro de Presença
    if (event.event === 'participant_joined') {
      console.log(`[PRESENÇA] ${event.participant?.identity} entrou na aula.`);
      //salvar no seu banco (Prisma/Mongoose) -> { user, room, joinedAt: Date.now() }
    }

    if (event.event === 'participant_left') {
      console.log(`[PRESENÇA] ${event.participant?.identity} saiu da aula.`);
      //calcular tempo de permanência no banco
    }

    res.status(200).send('ok');
  } catch (error) {
    res.status(400).send('Erro na validação do webhook');
  }
};