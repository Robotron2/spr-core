const stellarService = require("../services/stellar.service")

exports.getAccount = async (req, res, next) => {
	try {
		const { id } = req.params
		const account = await stellarService.getAccountDetails(id)
		res.json(account)
	} catch (error) {
		next(error)
	}
}

exports.createAccount = async (req, res, next) => {
	try {
		// Account creation logic
		res.json({ message: "Account created" })
	} catch (error) {
		next(error)
	}
}
