const {beforeMiddleware, onListening} = require('./server/configure');


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
