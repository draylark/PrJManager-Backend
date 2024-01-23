
import User from "../models/userSchema"
import Proyect from "../models/projectSchema"


// const isRoleValid = async( rol = '' ) => {
//     const roleExist = await Role.findOne({ rol })
//     if ( !roleExist ){
//         throw new Error(`El rol '${rol}' no esta registrado en la DB`)
//     }    
// }


const isEmailAlreadyExist = async( email = '') => {

    const exist = await User.findOne({ email })

    if( exist ){
        throw new Error(`El email ya esta registrado`)
    }

}


const isIdExist = async( id = '' ) => {

    const exist = await User.findById( id )

    if( !exist ){
        throw new Error(`El ID '${id}' no existe en la DB`)
    }

}

const isPrIdExist = async( id = '' ) => {

    const exist = await Proyect.findById( id )

    if( !exist ){
        throw new Error(`El ID '${id}' no existe en la DB`)
    }

}




export { 
    isIdExist,
    isEmailAlreadyExist,
    isPrIdExist
}

