import mongoose from 'mongoose'

const dbConnection = async () => {
    try {
        const mongoUri = process.env.MONGO_CNN;
        if (!mongoUri) {
            throw new Error('MONGO_CNN environment variable is not defined');
        }

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 10000,    // 10 segundos para intentar una conexión inicial
            socketTimeoutMS: 45000,     // 45 segundos de inactividad permitidos en un socket
            retryWrites: true,          // Habilita los reintentos automáticos en operaciones de escritura
            retryReads: true            // Habilita los reintentos automáticos en operaciones de lectura
        };

        await mongoose.connect(mongoUri, options);
        console.log('Base de datos inicializada');

    } catch (error) {
        console.warn('There has been an error while initializing the DB.');
        console.error(error);
        setTimeout(dbConnection, 5000); // Intenta reconectar cada 5 segundos en caso de falla inicial
    }
}

export default dbConnection;