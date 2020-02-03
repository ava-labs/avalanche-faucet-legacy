const bodyParser = require('body-parser');
const cors = require('cors');
const api = require('./api');

module.exports = app => {
    app.use(cors());
    app.use(bodyParser.json());
    app.use('/api', api)
}