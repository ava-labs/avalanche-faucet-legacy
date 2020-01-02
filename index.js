const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(bodyParser.json());


app.post('/token', (req, res) => {
    let address = req.body.address;

    console.log(`Address: ${address}`);
    res.json({
        status: 'success',
        message: 'You got the coins!'
    });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on ${port}`);
});