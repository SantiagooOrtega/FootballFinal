/**
 * Middleware global de manejo de errores
 * Captura todos los errores no manejados en la aplicación
 */
const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error [${req.method} ${req.path}]:`, err.message);

  // Error de validación de express-validator
  if (err.type === 'validation') {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.errors,
    });
  }

  // Error de PostgreSQL - violación de unicidad
  if (err.code === '23505') {
    const field = err.detail?.match(/\((\w+)\)/)?.[1] || 'campo';
    return res.status(409).json({
      error: `Ya existe un registro con ese ${field}.`,
      code: 'DUPLICATE_ENTRY',
    });
  }

  // Error de PostgreSQL - violación de llave foránea
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referencia inválida a un recurso que no existe.',
      code: 'FOREIGN_KEY_VIOLATION',
    });
  }

  // Error genérico del servidor
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor.'
      : err.message,
    code: err.code || 'INTERNAL_ERROR',
  });
};

/**
 * Crea un error con statusCode personalizado
 */
const createError = (message, statusCode = 400, code = 'ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

module.exports = { errorHandler, createError };
