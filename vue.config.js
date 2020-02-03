const {beforeMiddleware, onListening} = require('./src/server/configure');


module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "devServer": {
    before: beforeMiddleware,
    onListening: onListening,
    "https": true
  }
};