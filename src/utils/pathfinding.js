const { isValidAsset, validatePool } = require("../models/Pool")

const SCALE = 1000000000000n
const FEE_DENOMINATOR = 10000n

const toScaledBigInt = (value) => {
	if (typeof value !== "string" && typeof value !== "number") {
		return null
	}

	const stringValue = String(value)

	if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(stringValue)) {
		return null
	}

	const [whole, fraction = ""] = stringValue.split(".")
	const normalizedFraction = fraction.padEnd(12, "0").slice(0, 12)
	return BigInt(whole) * SCALE + BigInt(normalizedFraction)
}

const scaledBigIntToNumber = (value) => {
	const whole = value / SCALE
	const fraction = value % SCALE
	const fractionText = fraction.toString().padStart(12, "0").replace(/0+$/, "")
	const output = fractionText ? `${whole.toString()}.${fractionText}` : whole.toString()

	return Number(output)
}

const numericValue = (value) => {
	const numberValue = Number(value)
	return Number.isFinite(numberValue) ? numberValue : 0
}

const buildPoolGraph = (pools) => {
	if (!Array.isArray(pools) || pools.length === 0) {
		return {}
	}

	return pools.reduce((graph, pool) => {
		const validation = validatePool(pool)

		if (!validation.isValid) {
			return graph
		}

		if (!graph[pool.assetIn]) {
			graph[pool.assetIn] = []
		}

		graph[pool.assetIn].push(pool)
		return graph
	}, {})
}

const calculateLiquidityRisk = (pool) => {
	const reserveIn = numericValue(pool.reserveIn)
	const reserveOut = numericValue(pool.reserveOut)
	const tvl = numericValue(pool.tvl)
	const liquidity = Math.max(Math.min(reserveIn, reserveOut, tvl || Number.MAX_SAFE_INTEGER), 0)

	if (liquidity <= 0) {
		return 1
	}

	return 1 / (1 + Math.log10(liquidity + 1))
}

const scoreRoute = (path) => {
	if (!Array.isArray(path) || path.length === 0) {
		return 0
	}

	const hopCount = path.length
	const feeSum = path.reduce((sum, pool) => sum + pool.feeRate / 10000, 0)
	const slippageRisk = path.reduce((sum, pool) => sum + calculateLiquidityRisk(pool), 0)
	const denominator = hopCount + feeSum + slippageRisk

	return denominator > 0 ? 1 / denominator : 0
}

const findPaths = (graph, source, dest, maxHops = 5) => {
	if (!graph || typeof graph !== "object" || !isValidAsset(source) || !isValidAsset(dest)) {
		return []
	}

	if (source === dest || !Number.isInteger(maxHops) || maxHops < 1) {
		return []
	}

	const queue = [{ asset: source, path: [], visited: new Set([source]) }]
	const paths = []

	while (queue.length > 0) {
		const current = queue.shift()

		if (current.path.length >= maxHops) {
			continue
		}

		const outgoingPools = graph[current.asset] || []

		for (const pool of outgoingPools) {
			if (pool.assetIn !== current.asset || current.visited.has(pool.assetOut)) {
				continue
			}

			const nextPath = current.path.concat(pool)

			if (pool.assetOut === dest) {
				paths.push(nextPath)
				continue
			}

			const nextVisited = new Set(current.visited)
			nextVisited.add(pool.assetOut)
			queue.push({
				asset: pool.assetOut,
				path: nextPath,
				visited: nextVisited,
			})
		}
	}

	return paths
		.map((path, index) => ({ path, index, score: scoreRoute(path) }))
		.sort((left, right) => {
			if (right.score !== left.score) {
				return right.score - left.score
			}

			return left.index - right.index
		})
		.map((entry) => entry.path)
}

const validateRoute = (route, pools) => {
	const errors = []

	if (!Array.isArray(route) || route.length === 0) {
		return {
			isValid: false,
			errors: ["Route must contain at least one hop"],
		}
	}

	if (!Array.isArray(pools)) {
		errors.push("Pools must be an array")
	}

	const poolIds = new Set(Array.isArray(pools) ? pools.map((pool) => pool.id) : [])
	const visitedAssets = new Set()

	for (let index = 0; index < route.length; index += 1) {
		const pool = route[index]
		const validation = validatePool(pool)

		if (!validation.isValid) {
			errors.push(`Hop ${index} is invalid: ${validation.errors.join(", ")}`)
			continue
		}

		if (!poolIds.has(pool.id)) {
			errors.push(`Hop ${index} references an unknown pool`)
		}

		if (index > 0 && route[index - 1].assetOut !== pool.assetIn) {
			errors.push(`Hop ${index} does not connect to previous hop`)
		}

		if (visitedAssets.has(pool.assetIn)) {
			errors.push(`Hop ${index} creates a circular route`)
		}

		visitedAssets.add(pool.assetIn)

		if (visitedAssets.has(pool.assetOut)) {
			errors.push(`Hop ${index} creates a circular route`)
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

const calculateSwapOutput = (input, reserveIn, reserveOut, feeRate) => {
	const inputScaled = toScaledBigInt(input)
	const reserveInScaled = toScaledBigInt(reserveIn)
	const reserveOutScaled = toScaledBigInt(reserveOut)

	if (
		inputScaled === null ||
		reserveInScaled === null ||
		reserveOutScaled === null ||
		inputScaled <= 0n ||
		reserveInScaled <= 0n ||
		reserveOutScaled <= 0n ||
		!Number.isInteger(feeRate) ||
		feeRate < 0 ||
		feeRate >= 10000
	) {
		return 0
	}

	const feeMultiplier = BigInt(10000 - feeRate)
	const inputAfterFee = (inputScaled * feeMultiplier) / FEE_DENOMINATOR
	const denominator = reserveInScaled + inputAfterFee

	if (denominator <= 0n) {
		return 0
	}

	const outputScaled = (inputAfterFee * reserveOutScaled) / denominator
	return scaledBigIntToNumber(outputScaled)
}

module.exports = {
	buildPoolGraph,
	calculateSwapOutput,
	findPaths,
	scoreRoute,
	validateRoute,
}
