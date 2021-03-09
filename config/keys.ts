const { database, appSecret, emailPassword } = require('./dev');

module.exports = {
    database: process.env.DATABASE || database,
    appSecret: process.env.APPSECRET || appSecret,
    emailPassword: process.env.EMAILPASSWORD || emailPassword
}
