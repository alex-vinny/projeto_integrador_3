require('dotenv').config();

module.exports = {
    Host: process.env.MYSQL_HOST,
    Port: process.env.MYSQL_PORT,
    User: process.env.MYSQL_USER,
    Pass: process.env.MYSQL_PASS,
    Database: process.env.MYSQL_DB,
    AppId: Number(process.env.APP_ID),
    AppPort: process.env.PORT || 3000,
    AppIp: process.env.HOST || "0.0.0.0",
    SecretKey: process.env.SECRET_ID
};