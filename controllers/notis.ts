import { Response, Request } from 'express'
import Proyect from '../models/projectSchema';
import Noti from '../models/notisSchema';



const postNoti = async(req: Request, res: Response) => {


    const { title, description, by, to  } = req.body

    const noti = new Noti( { title, description, by, to } )
    await noti.save()

    res.json({
        noti,
        msg: 'Noti created'
    })
}; 


const getNotisbyUserId = async(req: Request, res: Response) => {

    const { uid } = req.params
    const { limit = 10, from = 0, type } = req.query

    const general = ['project-invitation', 'friend-request', 'new-follower', 'prj-updates', 'prj-patches', 'prj-announcements']
    
    const activity = ['new-commit', 
                         'new-task-commit', 'task-assignation', 'task-rejected', 'task-approved', 'task-invitation',  'added-to-repo', 'added-to-layer' ]

    try {
        if( type === 'general' ) {
            const notis = await Noti.find({ 
                type: { $in: general },
                recipient: uid, 
                status: true })
                .sort({ createdAt: -1 })
                .skip( Number( from ) )
                .limit( Number( limit ) )

            return res.json({
                notis
            });

        } else {
            const notis = await Noti.find({ 
                type: { $in: activity },
                recipient: uid, 
                status: true })
                .sort({ createdAt: -1 })
                .skip( Number( from ) )
                .limit( Number( limit ) )

            return res.json({
                notis
            });
        }       
    } catch (error) {
        console.log(error.message)
        return res.status(400).json({
            msg: 'Internal Server Error'
        })
    }

}; 



const putNoti = async(req: Request, res: Response) => {
    

    try {

        const { _id, ...rest } = req.body

        const noti = await Noti.findByIdAndUpdate( req.params.id, rest )

        res.json({
            msg: 'Proyect Updated',
            noti
        });


    } catch (error) {
        console.log(error)
        res.status(400).json({
            msg: 'Internal Server error',
            error
        })
    }

}; 


const deleteNoti = async(req: Request, res: Response) => {


    try {

        const projectId = req.params.id
        console.log(projectId)

        const noti = await Noti.findById( projectId )

        

        if(!noti) return res.status(400).json({
            msg: 'The project dont exist'
        })

        // Verificar si el usuario autenticado es el creador del proyecto
        if (noti.owner.toString() !== req.uid ) {
            return res.status(403).json({ msg: 'User not authorized' });
        }


        const projectDeleted = await Proyect.findByIdAndDelete( projectId )


        res.json({
            projectDeleted
        });

    } catch (error) {
        console.log(error)
    }




}; 



export {
    postNoti,
    getNotisbyUserId,
    putNoti,
    deleteNoti
}


