import { Request, Response } from 'express'
import Friend from '../models/friendSchema'
import User from '../models/userSchema'
import Noti from '../models/notisSchema'

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

export const addFriend = async (req: Request, res: Response) => {

  const { requestedUID } = req.params
  const { uid, username, photoUrl } = req.body

    try {
      const f = new Friend({ 
        friends_reference: [ requestedUID, uid ],
        requester: uid,
        recipient: requestedUID,
      })
      f.save()

      const noti = new Noti({
        type: 'friend-request',
        title: 'Friend request',
        description: `You have a new friend request`,
        from: {
          ID: uid,
          name: username,
          photoUrl: photoUrl || null
        },
        recipient: requestedUID,
        state: false
      })
      noti.save()

      return res.json({
        msg: 'Friend request sent',
        noti,
        f
      })

    } catch (error){
      return res.status(500).json({
        msg: 'Server error',
        error: error.message
      })
    } 

}

export const manageFriendsRequests = async (req: Request, res: Response) => {

  const { requestStatus, uid, notiID } = req.body
  const { requesterID } = req.params

  if( requestStatus === 'accept' ){

    try {
      const f = await Friend.findOneAndUpdate({ requester: requesterID, recipient: uid }, { friendship_status: 'accepted', state: true }, { new: true })
      const noti = await Noti.findByIdAndUpdate( notiID, { status: false }, { new: true })

      return res.json({
        msg: `Friend request accepted`,
        new_friend: f,
        notiTodelete: noti?._id
      })

    } catch (error){
      return res.status(500).json({
        msg: 'Server error',
        error: error.message
      })
    } 
  } else {

    try {
      const f = await Friend.findOneAndRemove({ requester: requesterID, recipient: uid })
      const noti = await Noti.findByIdAndUpdate( notiID, { status: false }, { new: true })

      res.json({
        msg: `Friend request rejected`,
        notiTodelete: noti?._id
      })

    } catch (error){
      return res.status(400).json({
        msg: 'Bad request'
      })
    } 
  }

}

export const deleteFriend = async (req: Request, res: Response) => {

}
