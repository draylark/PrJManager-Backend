import jwt from 'jsonwebtoken'
 
const generarJWT = ( uid: string ) => {

    return new Promise<string>(( resolve, reject ) => {

        const payload = { uid };

        const privatekey = process.env.SECRETORPRIVATEKEY
        if (!privatekey) {
            throw new Error('SECRET_KEY environment variable is not defined');
          }

        jwt.sign( 

            payload,  
            privatekey, 
            { expiresIn: "4hr" },
            ( err, token ) => {
                if( err ){
                console.log(err) 
                reject( 'No se pudo generar el token')
                } else {
                    if(!token) return 
                    resolve( token )
                }
            }
            
        );

    });

};


export default generarJWT