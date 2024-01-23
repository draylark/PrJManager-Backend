import { Request, Response } from 'express'
import Friend from '../models/friendSchema'
import User from '../models/userSchema'

export const getFriends = async (req: Request, res: Response) => {

}

export const getFriend = async (req: Request, res: Response) => {

}

export const addFriend = async (req: Request, res: Response) => {

  const { userId } = req.params

    try {
      const user = await User.findByIdAndUpdate(userId, { $push: { friendsRequests: req.body.uid } }, { new: true })
      return res.json({
        msg: 'Friend request sent',
        user
      })

    } catch (error){
      return res.status(500).json({
        msg: 'Server error',
        error: error.message
      })
    } 

}

export const manageFriendsRequests = async (req: Request, res: Response) => {

  const { requestStatus, uid: myUserId } = req.body
  const { userId } = req.params

  if( requestStatus === 'accepted' ){

    try {
      await User.findByIdAndUpdate( myUserId, { $pull: { friendsRequests: userId } }, { new: true })
      await User.findByIdAndUpdate( myUserId, { $push: { friends: userId } }, { new: true })

      const user = await User.findByIdAndUpdate( userId, { $push: { friends: myUserId } }, { new: true })
      return res.json({
        msg: `Friend request accepted`,
        user
      })

    } catch (error){
      return res.status(500).json({
        msg: 'Server error',
        error: error.message
      })
    } 
  } else {
      await User.findByIdAndUpdate( myUserId, { $pull: { friendsRequests: userId } }, { new: true })
      return res.json({
        msg: `Friend request rejected`
      })
  }

}

export const deleteFriend = async (req: Request, res: Response) => {

}
