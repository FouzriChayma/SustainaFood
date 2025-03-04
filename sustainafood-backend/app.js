var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var mongoose = require('mongoose');
var productRouter=require('./routes/productRoutes');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var donationRouter = require('./routes/donationRoutes');
var authRouter = require('./routes/authRoutes'); // 🔹 Ajouter la route auth

var app = express();
// var passport = require("passport"); // ✅ Importer Passport

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/uploads", express.static("uploads"));

// Enable CORS
app.use(cors());

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/product',productRouter);
app.use('/donation',donationRouter);
app.use('/auth', authRouter); // 🔹 Ajouter la route d'authentification

// Database Connection
var mongoConfig = require('./config/database.json');

mongoose.connect(mongoConfig.url)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

mongoose.connection.once('open', () => {
  console.log(" MongoDB connection established successfully");
});
////////////////////////////////////////////////////////////////
require("./config/passportConfig"); // Charger la config de Passport
// app.use(passport.initialize());
////////////////////////////////////////////
// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
