function errorHandler(err, req, res, next) {
  console.error('[API Error]', err.message || err);

  const statusCode = err.statusCode || (err.sqlState ? 400 : 500);
  
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal lounge service error',
    code: err.code || err.sqlState || 'INTERNAL_ERROR'
  });
}

module.exports = errorHandler;
