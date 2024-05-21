import { Request, Response } from 'express'
import Friend from '../models/friendSchema'
import User from '../models/userSchema'
import Noti from '../models/notisSchema'
import Friendship from '../models/friendshipSchema'

export const getFriends = async (req: Request, res: Response) => {
  const { uid } = req.params;

  try {
      // Encuentra documentos donde el arreglo `friends_reference` contenga el `uid`
      // y el estado sea `true`.
      const coincidences = await Friend.find({
          friends_reference: { $in: [uid] }, // Busca documentos donde `uid` está en `friends_reference`.
          state: true
      });

      // Filtra y extrae los IDs de los amigos, excluyendo el `uid` del usuario que hace la solicitud.
      const friends = coincidences.map(f => 
          f.friends_reference.find(id => id.toString() !== uid) // Encuentra el primer id que no sea el `uid`.
      ).filter(id => id !== undefined); // Filtra cualquier resultado undefined por si acaso.

      // Devuelve solo los IDs de los amigos.
      return res.json(friends);

  } catch (error) {
      return res.status(500).json({
          msg: 'Server error',
          error: error.message
      });
  }
};
export const getFriend = async (req: Request, res: Response) => {

}

export const newFriendRequest = async (req: Request, res: Response) => {

  const { requestedUID } = req.params
  const { uid, username, photoUrl } = req.body

    try {
      const friendship = new Friendship({
        requester: uid,
        recipient: requestedUID,
        status: 'pending'
      });
      await friendship.save();

      const noti = new Noti({
        type: 'friend-request',
        title: 'Friend request',
        description: `You have a new friend request`,
        recipient: requestedUID,
        from: {
          ID: uid,
          name: username,
          photoUrl: photoUrl || null
        },
        additionalData: {
          ref: friendship._id
        },
      })
      await noti.save()

      return res.json({
        message: 'Friend request sent',
        success: true
      })
    } catch (error){
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      })
    } 

}

export const handleFriendRequest = async (req: Request, res: Response) => {

  const { requestStatus, uid, notiID, ref } = req.body
  const { requesterID } = req.params

    try {
      if( requestStatus === 'accept' ){

          await Friendship.findOneAndUpdate(
            { _id: ref, requester: requesterID, recipient: uid, status: 'pending' },
            { status: 'accepted' }
          );

          await Noti.findByIdAndUpdate( notiID, { status: false })

          return res.json({
            accepted: true,
            message: `Friend request accepted.`,
          })
      } else {
       
          await Friendship.findOneAndUpdate(
            { _id: ref, requester: requesterID, recipient: uid, status: 'pending' },
            { status: 'rejected' }
          );

          await Noti.findByIdAndUpdate( notiID, { status: false })

          res.json({
            accepted: false,
            message: `Friend request rejected.`,
          })
      }
    } catch (error){
      return res.status(500).json({
        message: 'Internal Server Error',
        error: error.message
      })
    } 

}

export const deleteFriend = async (req: Request, res: Response) => {

}
