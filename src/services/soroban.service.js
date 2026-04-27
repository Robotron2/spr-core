const axios = require("axios")
const logger = require("../utils/logger")

const sorobanRpcUrl = process.env.SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org"

class SorobanService {
	async invokeContract(contractId, method, params) {
		try {
			const response = await axios.post(`${sorobanRpcUrl}/invoke`, {
				contractId,
				method,
				params,
			})
			return response.data
		} catch (error) {
			logger.error(`Failed to invoke contract: ${error.message}`)
			throw error
		}
	}

	async readContractData(contractId, key) {
		try {
			const response = await axios.get(`${sorobanRpcUrl}/contract/${contractId}/data/${key}`)
			return response.data
		} catch (error) {
			logger.error(`Failed to read contract data: ${error.message}`)
			throw error
		}
	}
}

module.exports = new SorobanService()
