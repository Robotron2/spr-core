const validateAsset = (asset) => {
	if (!asset || typeof asset !== "string") {
		throw new Error("Invalid asset format")
	}
	return true
}

const validateAmount = (amount) => {
	const num = parseFloat(amount)
	if (isNaN(num) || num <= 0) {
		throw new Error("Amount must be a positive number")
	}
	return true
}

const validateAccountId = (accountId) => {
	if (!accountId || !accountId.startsWith("G")) {
		throw new Error("Invalid Stellar account ID")
	}
	return true
}

module.exports = {
	validateAsset,
	validateAmount,
	validateAccountId,
}
