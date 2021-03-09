const mongoose = require('mongoose');
const { database } = require('./keys');

const db = async () => {
    try {
        await mongoose.connect(
            database,
            { 
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false,
                autoIndex: false, // Don't build indexes
                poolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                family: 4 // Use IPv4, skip trying IPv6
            },
            () => console.log('[CONNECTED] - Database'))
    } catch (err: any | unknown) {
        console.log(`Error: ${err}`)
        throw err;
    }
}

export default db;