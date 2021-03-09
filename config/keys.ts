if (!process.env.DATABASE) {
    const { database, appSecret, emailPassword } = require('./dev');
    module.exports = {
        database,
        appSecret,
        emailPassword
    }
} else {
    module.exports = {
        database: process.env.DATABASE,
        appSecret: process.env.APPSECRET,
        emailPassword: process.env.EMAILPASSWORD
    }
}