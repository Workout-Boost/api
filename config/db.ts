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
            },
            () => console.log('[CONNECTED] - Database'))
    } catch (err: any | unknown) {
        console.log(`Error: ${err}`)
        throw err;
    }
}

export default db;