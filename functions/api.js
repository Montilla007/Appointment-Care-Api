const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

const authRouter = require('./routes/auth')
const homeRouter = require('./routes/home')

app.use('/api/v1/Auth', authRouter)

router.get('/', (req, res) => {
res.send('App is running..');
});
router.get('/demo', (req, res) => {
    res.json([{
        id: '001',
        name: "Lance Kian Flores",
        email: "lancekian12@gmail.com"
    },{
        id: '002',
        name: "Christer Dale Reyes",
        email: "christer12@gmail.com"
    },{
        id: '003',
        name: "Chris Dale Reyes",
        email: "christer12@gmail.com"
    }
    ]);
    });

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);