const logger = require("../utils/logger")

const errorMiddleware = (err, req, res, _next) => {
	logger.error(`Error: ${err.message}`)

	const statusCode = err.statusCode || 500
	const message = err.message || "Internal Server Error"

	res.status(statusCode).json({
		error: {
			statusCode,
			message,
			timestamp: new Date(),
		},
	})
}

module.exports = errorMiddleware
