require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const app = express();

// connectDB
const connectDB = require('./db/connect')

const authenticateUser = require('./middleware/userAuthentication');
const authenticateAdmin = require('./middleware/adminAuthentication');

// routers
const authRouter = require('./routes/auth')
const homeRouter = require('./routes/home')
const personRouter = require('./routes/person')

const appointRouter = require('./routes/appointment')

const adminRouter = require('./routes/admin')
const panelRouter = require('./routes/panel')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
// extra packages
app.use(cors());

// routes
app.use('/api/v1/Auth', authRouter)
app.use('/api/v1/Person', personRouter)
app.use('/api/v1/home', authenticateUser, homeRouter)

app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/admin-panel', authenticateAdmin, panelRouter)

app.use('/api/v1/appoint', appointRouter)

app.use('/', (req, res) => {
  res.send("Hello my name is Christer Dale Reyes, the backend developer in Code of Duty aka the person who make miracles behind the curtain.");
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3001;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};
start();