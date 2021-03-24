const HOST = process.env.MYSQL_HOST || 'localhost'
const PORT = process.env.MYSQL_PORT || '3306'
const USERNAME = process.env.MYSQL_USERNAME || 'root'
const PASSWORD = process.env.MYSQL_PASSWORD || 'root'
const DB = process.env.MYSQL_DB || 'avalanche_faucet'

export default {
  "type": "mysql",
  "host": HOST,
  "port": parseInt(PORT),
  "username": USERNAME,
  "password": PASSWORD,
  "database": DB,
  "synchronize": true,
  "logging": false,
  "entities": [
    __dirname+"/server/entity/**/*.ts"
  ],
  "migrations": [
    "server/migration/**/*.ts"
  ],
  "subscribers": [
    "server/subscriber/**/*.ts"
  ],
  "options": {
    "useUTC": true
  }
}
