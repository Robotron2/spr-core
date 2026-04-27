const StellarSdk = require("@stellar/stellar-sdk")
const logger = require("../utils/logger")

const horizonUrl = process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org"
const server = new StellarSdk.Horizon.Server(horizonUrl)

class StellarService {
	async getAccountDetails(accountId) {
		try {
			const account = await server.loadAccount(accountId)
			return account
		} catch (error) {
			logger.error(`Failed to fetch account: ${error.message}`)
			throw error
		}
	}

	async getTransaction(transactionId) {
		try {
			const transaction = await server.transactions().transaction(transactionId).call()
			return transaction
		} catch (error) {
			logger.error(`Failed to fetch transaction: ${error.message}`)
			throw error
		}
	}

	async buildTransaction(params) {
		try {
			const { sourceAccount, destinationAccount, amount } = params
			const account = await server.loadAccount(sourceAccount)

			const transaction = new StellarSdk.TransactionBuilder(account, {
				fee: StellarSdk.BASE_FEE,
				networkPassphrase: StellarSdk.Networks.TESTNET_NETWORK_PASSPHRASE,
			})
				.addOperation(
					StellarSdk.Operation.payment({
						destination: destinationAccount,
						asset: StellarSdk.Asset.native(),
						amount: amount.toString(),
					}),
				)
				.setTimeout(30)
				.build()

			return transaction
		} catch (error) {
			logger.error(`Failed to build transaction: ${error.message}`)
			throw error
		}
	}

	async submitTransaction(transactionEnvelope) {
		try {
			const result = await server.submitTransaction(transactionEnvelope)
			logger.info(`Transaction submitted: ${result.id}`)
			return result
		} catch (error) {
			logger.error(`Failed to submit transaction: ${error.message}`)
			throw error
		}
	}
}

module.exports = new StellarService()
