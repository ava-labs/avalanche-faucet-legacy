const HOST = process.env.MYSQL_HOST || 'localhost'
const PORT = process.env.MYSQL_PORT || '3306'
const USERNAME = process.env.MYSQL_USERNAME || 'root'
const PASSWORD = process.env.MYSQL_PASSWORD || 'root'
const DB = process.env.MYSQL_DB || 'avalanche_faucet'

module.exports = {
  "type": "mysql",
  "host": HOST,
  "port": parseInt(PORT),
  "username": USERNAME,
  "password": PASSWORD,
  "database": DB,
  "synchronize": true,
  "logging": false,
  "entities": [
    __dirname+"/server/build/entity/**/*.js"
  ],
  "migrations": [
    __dirname+"server/build/migration/**/*.js"
  ],
  "subscribers": [
    __dirname+"server/build/subscriber/**/*.js"
  ],
  "options": {
    "useUTC": true
  }
}
