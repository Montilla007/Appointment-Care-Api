require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const app = express();

// connectDB
const connectDB = require('./db/connect')

const authenticateUser = require('./middleware/authentication');

// routers
const authRouter = require('./routes/auth')
const homeRouter = require('./routes/home')

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(express.json());
// extra packages
app.use(cors());

// routes
app.use('/api/v1/Auth', authRouter)
app.use('/api/v1/home', authenticateUser, homeRouter)

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