const errorHandler = (err, req, res, next) => {
  // Si el error tiene un status definido (como el 400 o 409 que creamos), lo usamos.
  // Si no, por defecto es 500 (Error interno del servidor).
  const statusCode = err.status || 500;

  // Regla no negociable: Responder siempre en JSON
  res.status(statusCode).json({
    error: err.message || "Error interno del servidor"
  });
};

module.exports = errorHandler;
