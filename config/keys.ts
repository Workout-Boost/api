if (process.env.DATABASE) {
    module.exports = {
        database: process.env.DATABASE,
        appSecret: process.env.APPSECRET,
        emailPassword: process.env.EMAILPASSWORD
    }
} else {
    const { database, appSecret, emailPassword } = require('./dev');
    module.exports = {
        database,
        appSecret,
        emailPassword
    }
}