import User from "../models/userSchema"

const isEmailAlreadyExist = async( email: string ) => {

    const exist = await User.findOne({ email })

    if( exist ){
        throw new Error(`The email already exists`)
    }

}


export {
    isEmailAlreadyExist
}
