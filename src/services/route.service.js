const { generateMockPools } = require("../__tests__/fixtures/mockPools")
const { isValidAsset } = require("../models/Pool")
const {
	buildPoolGraph,
	calculateSwapOutput,
	findPaths,
	scoreRoute,
	validateRoute,
} = require("../utils/pathfinding")
const logger = require("../utils/logger")

const buildErrorResponse = (sourceAsset, destinationAsset, amount, errors) => ({
	sourceAsset,
	destinationAsset,
	amount,
	path: [],
	totalFee: 0,
	estimatedOutput: 0,
	minReceived: 0,
	hopCount: 0,
	efficiency: 0,
	timestamp: new Date().toISOString(),
	error: {
		code: "ROUTE_NOT_FOUND",
		messages: errors,
	},
})

class RouteService {
	async findRoute(sourceAsset, destinationAsset, amount) {
		try {
			const inputAmount = Number(amount)
			const errors = []

			if (!isValidAsset(sourceAsset)) {
				errors.push("Invalid source asset")
			}

			if (!isValidAsset(destinationAsset)) {
				errors.push("Invalid destination asset")
			}

			if (!Number.isFinite(inputAmount) || inputAmount <= 0) {
				errors.push("Amount must be a positive number")
			}

			if (sourceAsset === destinationAsset) {
				errors.push("Source and destination assets must be different")
			}

			if (errors.length > 0) {
				return buildErrorResponse(sourceAsset, destinationAsset, amount, errors)
			}

			const pools = generateMockPools()
			const graph = buildPoolGraph(pools)
			const paths = findPaths(graph, sourceAsset, destinationAsset, 5)

			if (paths.length === 0) {
				return buildErrorResponse(sourceAsset, destinationAsset, amount, ["No route found"])
			}

			const bestPath = paths[0]
			const validation = validateRoute(bestPath, pools)

			if (!validation.isValid) {
				return buildErrorResponse(sourceAsset, destinationAsset, amount, validation.errors)
			}

			const simulation = bestPath.reduce(
				(state, pool) => {
					const output = calculateSwapOutput(state.currentAmount, pool.reserveIn, pool.reserveOut, pool.feeRate)

					return {
						currentAmount: output,
						hops: state.hops.concat({
							poolId: pool.id,
							assetIn: pool.assetIn,
							assetOut: pool.assetOut,
							feeRate: pool.feeRate,
							input: state.currentAmount,
							output,
						}),
					}
				},
				{ currentAmount: inputAmount, hops: [] },
			)

			if (simulation.currentAmount <= 0) {
				return buildErrorResponse(sourceAsset, destinationAsset, amount, ["Route has insufficient liquidity"])
			}

			const totalFee = bestPath.reduce((sum, pool) => sum + pool.feeRate / 10000, 0)
			const efficiency = scoreRoute(bestPath)

			return {
				sourceAsset,
				destinationAsset,
				amount,
				path: simulation.hops,
				totalFee,
				estimatedOutput: simulation.currentAmount,
				minReceived: simulation.currentAmount * 0.995,
				hopCount: bestPath.length,
				efficiency,
				timestamp: new Date().toISOString(),
			}
		} catch (error) {
			logger.error(`Failed to find route: ${error.message}`)
			return buildErrorResponse(sourceAsset, destinationAsset, amount, [error.message])
		}
	}

	async simulateRoute(route) {
		try {
			if (!Array.isArray(route) || route.length === 0) {
				return {
					isValid: false,
					estimatedOutput: 0,
				}
			}

			const pools = generateMockPools()
			const validation = validateRoute(route, pools)

			return {
				isValid: validation.isValid,
				errors: validation.errors,
				estimatedOutput: 0,
			}
		} catch (error) {
			logger.error(`Failed to simulate route: ${error.message}`)
			throw error
		}
	}
}

module.exports = new RouteService()
