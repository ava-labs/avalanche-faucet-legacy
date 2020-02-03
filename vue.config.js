const configureAPI = require('./src/server/configure');


module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "devServer": {
    before: configureAPI,
    "https": true
  }
};