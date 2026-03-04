import { AccessToken } from 'livekit-server-sdk';

export const getJoinToken = async (req: any, res: any) => {
  const { roomName, userName, role } = req.body; //role: 'prof' ou 'aluno'

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: userName,
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    //Hierarquia:
    canPublish: role === 'prof',      //aluno não publica vídeo/áudio sozinho
    canPublishData: true,             //ambos usam o chat
    canSubscribe: true,               //ambos assistem
    roomAdmin: role === 'prof',       //só prof pode expulsar/mutar
  });

  res.send({ token: await at.toJwt() });
};