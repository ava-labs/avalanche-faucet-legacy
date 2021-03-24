const {beforeMiddleware, onListening} = require('./server/build/configure');

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
