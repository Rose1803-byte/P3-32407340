var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var createError = require('http-errors'); // Aseguramos que createError esté definido

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// ----------------------------------------------------
// IMPLEMENTACIÓN DE ENDPOINTS DE LA ASIGNACIÓN (Paso 2)
// ----------------------------------------------------

/* RUTA GET /ping */
// Responde con un estado 200 (OK) y cuerpo vacío.
app.get('/ping', function(req, res, next) {
  res.status(200).end(); 
});

/* RUTA GET /about */
// Responde con datos personales en formato JSend 'success'.
app.get('/about', function(req, res, next) {
  const responseData = {
    status: "success",
    data: {
      nombreCompleto: "ROSELYN SABRINA BOLIVAR MEDINA", // ⬅️ ¡REEMPLAZA ESTO CON TU NOMBRE!
      cedula: "32407340",           // ⬅️ ¡REEMPLAZA ESTO CON TU CÉDULA!
      seccion: "2"         // ⬅️ ¡REEMPLAZA ESTO CON TU SECCIÓN!
    }
  };
  // El método .json() envía la respuesta y usa un código de estado 200 por defecto.
  res.json(responseData); 
});

// ----------------------------------------------------
// FIN DE ENDPOINTS DE LA ASIGNACIÓN
// ----------------------------------------------------


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // Nota: Si usaste --no-view, el render('error') fallará o devolverá HTML simple.
  // En una API, normalmente solo enviarías el JSON del error.
  res.send({ status: 'error', message: err.message, stack: req.app.get('env') === 'development' ? err.stack : undefined });
});

module.exports = app