var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');
//var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.gif'));
app.use(partials());
app.use(logger('dev'));
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser('Quiz_2015'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
//app.use(methodOverride('_method'));
app.use(methodOverride('_method',  { methods: ['POST','GET']}));
app.use(express.static(path.join(__dirname, 'public')));

//tiempo de sesion
app.use(function(req, res, next) {
    if(req.session.user){// si estamos en una sesion
    	if(!req.session.marcatiempo){//primera vez se pone la marca de tiempo
    		req.session.marcatiempo=(new Date()).getTime();
    		req.session.plazo=120;//ponemos 120 segundos para que pueda controlarse la caducidad de la sesion
    	}else{
    		if((new Date()).getTime()-req.session.marcatiempo > 120000){//se pasó el tiempo y eliminamos la sesión (2min=120000ms)
    			delete req.session.user; 	//eliminamos el usuario
    			delete req.session.marcatiempo;	//eliminamos la marca de tiempo
    		}else{//hay actividad se pone nueva marca de tiempo
    			req.session.marcatiempo=(new Date()).getTime();
    			req.session.plazo=120;//ponemos 120 segundos para que pueda controlarse la caducidad de la sesion
    		}
    	}
    }
    next();
});

// Helpers dinamicos:
app.use(function(req, res, next) {
    // guardar path en session.redir para despues del login
    if(!req.path.match(/\/login|\/logout/)){
    	req.session.redir = req.path;
    }
    // hacer visible req.session en las vistas
    res.locals.session = req.session;
    next();
});

app.use('/', routes);
//app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        errors: []
    });
});


module.exports = app;
