import mongoose from 'mongoose'

const dbConnection = async() => {

    try {
        const mongoUri = process.env.MONGO_CNN;
        if (!mongoUri) {
          throw new Error('MONGO_CNN environment variable is not defined');
        }

        await mongoose.connect( mongoUri );
        console.log('Base de datos inicializada');
        
    } catch (error) {
        console.warn('Theres been an error while initializing the DB.')
        console.error(error)
    }

}



export default dbConnection