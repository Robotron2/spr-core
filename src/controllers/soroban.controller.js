const sorobanService = require("../services/soroban.service")

exports.invokeContract = async (req, res, next) => {
	try {
		const { contractId, method, params } = req.body
		const result = await sorobanService.invokeContract(contractId, method, params)
		res.json(result)
	} catch (error) {
		next(error)
	}
}

exports.readContractData = async (req, res, next) => {
	try {
		const { contractId, key } = req.params
		const data = await sorobanService.readContractData(contractId, key)
		res.json({ data })
	} catch (error) {
		next(error)
	}
}
