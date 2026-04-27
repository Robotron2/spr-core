const stellarService = require("../services/stellar.service")

exports.getTransaction = async (req, res, next) => {
	try {
		const { id } = req.params
		const transaction = await stellarService.getTransaction(id)
		res.json(transaction)
	} catch (error) {
		next(error)
	}
}

exports.createTransaction = async (req, res, next) => {
	try {
		const { sourceAccount, destinationAccount, amount } = req.body
		const transaction = await stellarService.buildTransaction({
			sourceAccount,
			destinationAccount,
			amount,
		})
		res.json(transaction)
	} catch (error) {
		next(error)
	}
}

exports.submitTransaction = async (req, res, next) => {
	try {
		const { transactionEnvelope } = req.body
		const result = await stellarService.submitTransaction(transactionEnvelope)
		res.json(result)
	} catch (error) {
		next(error)
	}
}
