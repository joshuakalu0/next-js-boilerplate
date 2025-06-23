
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const config = require('./config');
const createSessionStore = require('./config/sessionStore')
require('./passport/googleStrategy');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerOptions = require('./swagger/swaggerOptions');

const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(express.json());

mongoose.connect(config.mongoUri)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('MongoDB error', err));

app.use(session({ secret: config.jwtSecret, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
const sessionStore = createSessionStore(config.dbType);
app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

module.exports = app;
