import { Response, Request } from 'express'
import User from '../models/userSchema';
import bcryptjs from 'bcryptjs'
import Friendship from '../models/friendshipSchema';
import Noti from '../models/notisSchema';
import Follower from '../models/followerSchema';
import { parseArgs } from 'util';





export const findUsers = async (req: Request, res: Response) => {
    const search = req.query.search as string;

    try {
        let queryConditions: Record<string, any>[] = [{ username: { $regex: search, $options: 'i' } }];

        // Intentar agregar la condición de búsqueda por ID si 'search' es un ID válido
        if (search &&  search.match(/^[0-9a-fA-F]{24}$/)) {
            queryConditions.push({ _id: search });
        }

        const users = await User.find({ $or: queryConditions });

        // Asumiendo que quieres enviar los usuarios encontrados como respuesta
        res.json({
            users
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al buscar usuarios'
        });
    }
}




export const getUsers = async (req: Request, res: Response) => {
    const { limit = 4, from = 0 } = req.query;
    const { IDS } = req.body; // Asume que 'IDS' es un arreglo de IDs de usuario
  
    try {
      const users = await User.find({ 
        '_id': { $in: IDS }, // Usa $in para seleccionar usuarios con IDs en el arreglo 'IDS'
        'state': true // Asumiendo que quieres seguir filtrando por el estado si es necesario
      })
      .skip(Number(from)) // Asegúrate de convertir 'from' y 'limit' a números
      .limit(Number(limit))
      .select('photoUrl _id username'); // Solo incluye 'photoUrl', '_id', y 'username'
  
      // Como el total específico de usuarios devueltos ya está definido por la longitud de 'users', no es necesario contarlos por separado
      const total = users.length;
  
      res.json({
        msg: 'get API - controller modified',
        total,
        users
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: 'Error al obtener los usuarios'
      });
    }
};

export const getUsersById = async( req: Request, res: Response ) => {

    const { id } = req.params


    try {

        const user = await User.findOne( { _id: id } )

        if(!user) return res.status(400).json({
            msg: 'User not found'
        })

        res.json({
            user
        })

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error1'
        })
    }


}; 


export const getProfile = async( req: Request, res: Response ) => {

    const { uid } = req.params;

    try {
        const user = await User.findById( uid )
                    .select('username _id photoUrl website github twitter linkedin description createdAt followers')

        res.json({
            user
        });
    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error2',
            error
        })   
    };
};



export const putUsers = async( req: Request, res: Response ) => {

    const { id } = req.params
    const { _id, password, google, ...resto } = req.body


    try {

        if( password ){
            const salt = bcryptjs.genSaltSync(10);
            resto.password = bcryptjs.hashSync( password, salt );
        }

        const user = await User.findByIdAndUpdate( id, resto )

        res.json({
            user
        })

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error2',
            error
        })
    }


}; 

export const updateUserTopProjects = async( req: Request, res: Response ) => {

    const { uid } = req.params
    const { currentTopProjects: topProjects } = req.body

    try {

        const user = await User.findByIdAndUpdate( uid, { topProjects }, { new: true } )
                            .populate({
                                path: 'topProjects',
                                select: '_id name'
                            })

        res.json({
            response: 'Top projects updated successfully!',
            user
        })

    } catch (error) {
        return res.status(500).json({
            msg: 'Internal server Error3',
            error
        })
    }

};


export const deleteUsers = async( req: Request, res: Response ) => {

    const { id } = req.params
    const { authenticatedUser } = req
    const user = await User.findByIdAndUpdate( id, { state: false } );

    return res.json({
        user,
        authenticatedUser
    });

}; 


export const updateMyLinks = async( req: Request, res: Response ) => {

    const { uid } = req.params
    const { website, github, twitter, linkedin } = req.body

    try {
        const user = await User.findByIdAndUpdate( uid, { website, github, twitter, linkedin }, { new: true } )
        res.json({
            user
        })
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server Error4',
            error
        })
    }

};

export const getMyMonthlyActivity = async( req: Request, res: Response ) => {
    const { projectsLength, commitsLength, completedTasksLength } = req

    return res.json({
        projectsLength,
        commitsLength,
        completedTasksLength
    });
};

export const getTimelineActivity = async( req: Request, res: Response ) => {
    const { allEvents } = req

    try {
        res.json(allEvents);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

export const getProjectTimelineActivity = async( req: Request, res: Response ) => {
    const { allEvents } = req

    try {
        res.json(allEvents);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};


export const followProfile = async( req: Request, res: Response ) => {

    const { profileUID, uid, photoUrl, username } = req.body

    try {   
        // Agregar seguimiento
        const follower = await Follower.create({ 
            uid: profileUID,
            followerId: uid
         });

         const populatedFollower = await Follower.findById(follower._id)
         .select('uid')            
         .populate('uid', 'username photoUrl _id')

        // Verificar si hay un seguimiento mutuo
        const mutualFollow = await Follower.findOne({ 
            uid: uid,
            followerId: profileUID
        });

        await User.findByIdAndUpdate(profileUID, {
            $inc: { followers: 1 }
        });


        if (mutualFollow) {
            // Crear documento de amistad

            await Follower.updateOne({ uid: profileUID, followerId: uid }, { mutualFollow: true })
            await Follower.updateOne({ uid, followerId: profileUID }, { mutualFollow: true })

            const friendship = await Friendship.create({ ids: [ profileUID, uid ] });    
            const noti = new Noti({
                type: 'new-follower',
                title: 'New Follower',
                description: `You have a new follower`,
                recipient: profileUID,
                from: {
                    ID: uid,
                    name: username,
                    photoUrl: photoUrl || null
                }
            })
            await noti.save()

            const populatedFriendship = await Friendship.findById(friendship._id).populate('ids');

            return res.json({
                followedProfile: populatedFollower,
                friendship: populatedFriendship,
                type: 'friendship',
                success: true,
                message: 'Profile followed successfully'
            });              
        };

        const noti = new Noti({
            type: 'new-follower',
            title: 'New Follower',
            description: `You have a new follower`,
            recipient: profileUID,
            from: {
                ID: uid,
                name: username,
                photoUrl: photoUrl || null
            }
        });
        await noti.save()

        res.json({
            followedProfile: populatedFollower,
            friendship: null,
            type: 'follower',
            success: true,
            message: 'Profile followed successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


export const unfollowProfile = async( req: Request, res: Response ) => {
    const { profileUID } = req.params
    const { uid } = req.query

    try { 
        // Eliminar seguimiento
        await Follower.findOneAndDelete({
            uid: profileUID,
            followerId: uid
        });

        const friendshipRef = await Friendship.findOne({
            ids: { $all: [profileUID, uid] },
            active: true
        })
        .select('_id')

        const friendship = await Friendship.findOneAndDelete({
            ids: { $all: [profileUID, uid] },
            active: true
        });
    

        await User.findByIdAndUpdate(profileUID, {
            $inc: { followers: -1 }
        });

        await User.findByIdAndUpdate(uid, {
            $inc: { following: -1 }
        });

        if (friendship) {
            await Follower.updateOne({ uid, followerId: profileUID }, { mutualFollow: false })

            await User.findByIdAndUpdate(uid, {
                $inc: { friends: -1 }
            });

            await User.findByIdAndUpdate(profileUID, {
                $inc: { friends: -1 }
            })

            return res.json({
                friendshipRef: friendshipRef?._id,
                type: 'friendship',
                success: true,
                message: 'Profile unfollowed successfully'
            });
        }

        res.json({
            friendshipRef: null,
            type: 'follower',
            success: true,
            message: 'Profile unfollowed successfully'
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}


export const getUsersRelation = async (req: Request, res: Response) => {
    const { uid, profileUID } = req.query

    try {
        const followsMe = await Follower.findOne({ uid: uid, followerId: profileUID })
        const iFollow = await Follower.findOne({ uid: profileUID, followerId: uid })
        const friendship = await Friendship.findOne({
            ids: { $all: [profileUID, uid] },
            active: true
        });

        res.json({
            followsMe: !!followsMe,
            iFollow: !!iFollow,
            friendship: !!friendship
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
}


export const getFollowersAndFollowingFriends = async (req: Request, res: Response) => {
    const { uid } = req.params
    const { limit = 15 } = req.query

    try {
        const followers = await Follower.find({ uid })
                                .select('followerId mutualFollow')
                                .populate('followerId', 'username photoUrl')
                                .limit(Number(limit));

        const following = await Follower.find({ followerId: uid })
                                .select('uid mutualFollow')
                                .populate('uid', 'username photoUrl')
                                .limit(Number(limit));

        const friends = await Friendship.find({
            ids: uid,
            active: true
        })
        .populate('ids', 'username photoUrl')
        .limit(Number(limit));


        const followersCount = await Follower.countDocuments({ uid });
        const followingCount = await Follower.countDocuments({ followerId: uid });
        const friendsCount = await Friendship.countDocuments({
            ids: uid,
            active: true
        });

        res.json({
            followers,
            following,
            friends,
            followersLength: followersCount,
            followingLength: followingCount,
            friendsLength: friendsCount,

            totalFollowersPages: Math.ceil(followersCount / Number(limit)),
            totalFollowingPages: Math.ceil(followingCount / Number(limit)),
            totalFriendsPages: Math.ceil(friendsCount / Number(limit))
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
}



export const getProfileFollowersFollowing = async (req: Request, res: Response) => {
    const { profileUID } = req.params;
    const { limit = 15 } = req.query;

    try {
        const followers = await Follower.find({ uid: profileUID })
            .select('followerId')
            .populate('followerId', 'username photoUrl')
            .limit(Number(limit));
    
        const following = await Follower.find({ followerId: profileUID })
            .select('uid')
            .populate('uid', 'username photoUrl')
            .limit(Number(limit));


        const followersCount = await Follower.countDocuments({ uid: profileUID });    
        const followingCount = await Follower.countDocuments({ followerId: profileUID });
    
        res.json({
            followers,
            following,
            followersLength: followersCount,
            followingLength: followingCount,
            totalFollowersPages: Math.ceil(followersCount / Number(limit)),
            totalFollowingPages: Math.ceil(followingCount / Number(limit)),
        });   
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error',
        error
      });
    }
  };


  export const getFollowers = async (req: Request, res: Response) => {
    const { profileUID } = req.params;
    const { limit = 15, page } = req.query;
  
    try {
        const followers = await Follower.find({ uid: profileUID })
            .select('followerId mutualFollow')
            .populate('followerId', 'username photoUrl')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        // Verificar que siguen devuelta




        res.json({
            followers,
        });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error',
        error
      });
    }
  }


export const getFollowing = async (req: Request, res: Response) => {
    const { profileUID } = req.params;
    const { limit = 15, page } = req.query;

    try {
        const following = await Follower.find({ followerId: profileUID })
            .select('uid')
            .populate('uid', 'username photoUrl')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            following,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
}


export const getFriends = async (req: Request, res: Response) => {
    const { uid } = req.params;
    const { limit = 15, page } = req.query;

    try {
        const friends = await Friendship.find({ ids: uid, active: true })
            .populate('ids', 'username photoUrl')
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        res.json({
            friends,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
}


export const getFollowersLength = async (req: Request, res: Response) => {
    const { uid } = req.params

    try {
        const followers = await Follower.find({ uid });

        res.json({
            followersLength: followers.length
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error
        });
    }
}