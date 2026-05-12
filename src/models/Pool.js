const ASSET_PATTERN = /^(native|[A-Z0-9]{1,12}:G[A-Z0-9]{55})$/

const isStringSafeNumber = (value) => {
	if (typeof value !== "string" && typeof value !== "number") {
		return false
	}

	const stringValue = String(value)
	return /^(0|[1-9]\d*)(\.\d+)?$/.test(stringValue)
}

const isValidAsset = (asset) => typeof asset === "string" && ASSET_PATTERN.test(asset)

const isGreaterThanZero = (value) => {
	if (!isStringSafeNumber(value)) {
		return false
	}

	return !/^0(?:\.0+)?$/.test(String(value))
}

const validatePool = (pool) => {
	const errors = []

	if (!pool || typeof pool !== "object") {
		return {
			isValid: false,
			errors: ["Pool must be an object"],
		}
	}

	if (!pool.id || typeof pool.id !== "string") {
		errors.push("Pool id must be a string")
	}

	if (!isValidAsset(pool.assetIn)) {
		errors.push("Pool assetIn is invalid")
	}

	if (!isValidAsset(pool.assetOut)) {
		errors.push("Pool assetOut is invalid")
	}

	if (!isGreaterThanZero(pool.reserveIn)) {
		errors.push("Pool reserveIn must be greater than zero")
	}

	if (!isGreaterThanZero(pool.reserveOut)) {
		errors.push("Pool reserveOut must be greater than zero")
	}

	if (!Number.isInteger(pool.feeRate) || pool.feeRate < 0 || pool.feeRate > 10000) {
		errors.push("Pool feeRate must be an integer between 0 and 10000 basis points")
	}

	if (!Number.isInteger(pool.createdAt) || pool.createdAt < 0) {
		errors.push("Pool createdAt must be a non-negative integer timestamp")
	}

	if (!isStringSafeNumber(pool.tvl)) {
		errors.push("Pool tvl must be a non-negative number")
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

const createPool = (pool) => {
	const validation = validatePool(pool)

	if (!validation.isValid) {
		throw new Error(`Invalid pool: ${validation.errors.join(", ")}`)
	}

	return Object.freeze({
		id: pool.id,
		assetIn: pool.assetIn,
		assetOut: pool.assetOut,
		reserveIn: pool.reserveIn,
		reserveOut: pool.reserveOut,
		feeRate: pool.feeRate,
		createdAt: pool.createdAt,
		tvl: pool.tvl,
	})
}

module.exports = {
	ASSET_PATTERN,
	createPool,
	isValidAsset,
	validatePool,
}
