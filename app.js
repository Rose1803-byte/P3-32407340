
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var createError = require('http-errors'); 

var app = express();


const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public'))); 


app.get('/ping', function(req, res, next) {
    res.status(200).json({ status: 'ok' }); 
});


app.get('/about', function(req, res, next) {
    const responseData = {
        status: "success",
        data: {
            nombreCompleto: "ROSELYN SABRINA BOLIVAR MEDINA",
            cedula: "32407340",         
            seccion: "2"          
        }
    };
    res.json(responseData); 
});


app.use(function(req, res, next) {
    res.status(404).json({ 
        status: "fail",
        data: {
            message: "Ruta no encontrada (Not Found)"
        }
    });
});


app.use(function(err, req, res, next) {
    
    
    const status = err.status || 500; 
    
    res.status(status).json({ 
        status: 'error', 
        message: err.message, 
     
        stack: req.app.get('env') === 'development' ? err.stack : undefined 
    });
});


module.exports = app;
