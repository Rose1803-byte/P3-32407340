// utils/helpers.js

/**
 * Envía una respuesta estandarizada en formato JSend.
 */
const handleResponse = (res, statusCode, message, data = null) => {
  if (statusCode >= 500) {
    // Estado 'error' (Error del servidor)
    return res.status(statusCode).json({
      status: 'error',
      message: message,
    });
  } else if (statusCode >= 400) {
    // Estado 'fail' (Error del cliente)
    // Tus pruebas de auth esperan que el mensaje esté en 'data'
    return res.status(statusCode).json({
      status: 'fail',
      data: { message: message },
    });
  } else {
    // Estado 'success'
    return res.status(statusCode).json({
      status: 'success',
      data: data, // Los datos van aquí
    });
  }
};

module.exports = { handleResponse };