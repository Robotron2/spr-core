const { createPool } = require("../models/Pool")
const routeService = require("../services/route.service")
const { ASSETS, generateMockPools } = require("./fixtures/mockPools")
const {
	buildPoolGraph,
	calculateSwapOutput,
	findPaths,
	scoreRoute,
	validateRoute,
} = require("../utils/pathfinding")

const issuer = (char) => `G${char.repeat(55)}`
const asset = (code, char) => `${code}:${issuer(char)}`

const makePool = (overrides) =>
	createPool({
		id: "pool-default",
		assetIn: ASSETS.XLM,
		assetOut: ASSETS.USDC,
		reserveIn: "1000000",
		reserveOut: "1000000",
		feeRate: 30,
		createdAt: 1700000000,
		tvl: "2000000",
		...overrides,
	})

describe("pathfinding graph", () => {
	it("maps each asset to its outgoing pools in insertion order", () => {
		const pools = generateMockPools()
		const graph = buildPoolGraph(pools)

		expect(graph[ASSETS.XLM].map((pool) => pool.id)).toEqual([
			"pool-001-xlm-usdc-direct-low-fee",
			"pool-003-xlm-btc",
			"pool-005-xlm-eth",
			"pool-007-xlm-usdc-low-liquidity",
			"pool-017-xlm-brl",
		])
		expect(graph[ASSETS.USDC].map((pool) => pool.assetOut)).toEqual([
			ASSETS.EURT,
			ASSETS.NGNT,
			ASSETS.AQUA,
			ASSETS.DEAD1,
		])
	})

	it("returns an empty graph for empty input", () => {
		expect(buildPoolGraph([])).toEqual({})
		expect(buildPoolGraph()).toEqual({})
	})
})

describe("pathfinding BFS", () => {
	it("finds a single-hop route", () => {
		const graph = buildPoolGraph(generateMockPools())
		const paths = findPaths(graph, ASSETS.XLM, ASSETS.USDC)

		expect(paths[0]).toHaveLength(1)
		expect(paths[0][0].assetIn).toBe(ASSETS.XLM)
		expect(paths[0][0].assetOut).toBe(ASSETS.USDC)
	})

	it("finds multi-hop routes between two and five hops", () => {
		const graph = buildPoolGraph(generateMockPools())
		const paths = findPaths(graph, ASSETS.XLM, ASSETS.EURT)

		expect(paths.some((path) => path.length === 2)).toBe(true)
		expect(paths.every((path) => path.length <= 5)).toBe(true)
		expect(paths[0].at(-1).assetOut).toBe(ASSETS.EURT)
	})

	it("returns no route when destination is disconnected", () => {
		const graph = buildPoolGraph(generateMockPools())

		expect(findPaths(graph, ASSETS.DEAD1, ASSETS.USDC)).toEqual([])
	})

	it("prevents cycles in each path", () => {
		const graph = buildPoolGraph(generateMockPools())
		const paths = findPaths(graph, ASSETS.XLM, ASSETS.EURT)

		for (const path of paths) {
			const assets = [path[0].assetIn].concat(path.map((pool) => pool.assetOut))
			expect(new Set(assets).size).toBe(assets.length)
		}
	})

	it("enforces max hop limits", () => {
		const a = asset("AAAA", "A")
		const b = asset("BBBB", "B")
		const c = asset("CCCC", "C")
		const d = asset("DDDD", "D")
		const e = asset("EEEE", "E")
		const f = asset("FFFF", "F")
		const g = asset("GGGG", "G")
		const pools = [
			makePool({ id: "p1", assetIn: a, assetOut: b }),
			makePool({ id: "p2", assetIn: b, assetOut: c }),
			makePool({ id: "p3", assetIn: c, assetOut: d }),
			makePool({ id: "p4", assetIn: d, assetOut: e }),
			makePool({ id: "p5", assetIn: e, assetOut: f }),
			makePool({ id: "p6", assetIn: f, assetOut: g }),
		]

		expect(findPaths(buildPoolGraph(pools), a, g, 5)).toEqual([])
		expect(findPaths(buildPoolGraph(pools), a, f, 5)[0]).toHaveLength(5)
	})
})

describe("route scoring", () => {
	it("scores fewer hops higher when fee and liquidity are equal", () => {
		const direct = [makePool({ id: "direct" })]
		const multiHop = [
			makePool({ id: "hop-1", assetIn: ASSETS.XLM, assetOut: ASSETS.BTC }),
			makePool({ id: "hop-2", assetIn: ASSETS.BTC, assetOut: ASSETS.USDC }),
		]

		expect(scoreRoute(direct)).toBeGreaterThan(scoreRoute(multiHop))
	})

	it("scores lower fee paths higher when hop count and liquidity are equal", () => {
		const lowFee = [makePool({ id: "low-fee", feeRate: 10 })]
		const highFee = [makePool({ id: "high-fee", feeRate: 100 })]

		expect(scoreRoute(lowFee)).toBeGreaterThan(scoreRoute(highFee))
	})

	it("returns deterministic scores", () => {
		const path = [
			makePool({ id: "hop-1", assetIn: ASSETS.XLM, assetOut: ASSETS.BTC }),
			makePool({ id: "hop-2", assetIn: ASSETS.BTC, assetOut: ASSETS.USDC }),
		]

		expect(scoreRoute(path)).toBe(scoreRoute(path))
	})

	it("sorts paths by score descending", () => {
		const source = asset("SRC", "S")
		const dest = asset("DEST", "T")
		const pools = [
			makePool({
				id: "high-fee",
				assetIn: source,
				assetOut: dest,
				feeRate: 100,
			}),
			makePool({
				id: "low-fee",
				assetIn: source,
				assetOut: dest,
				feeRate: 10,
			}),
		]

		const paths = findPaths(buildPoolGraph(pools), source, dest)
		expect(paths[0][0].id).toBe("low-fee")
	})

	it("penalizes small liquidity pools", () => {
		const highLiquidity = [makePool({ id: "high-liquidity", reserveIn: "1000000", reserveOut: "1000000", tvl: "2000000" })]
		const lowLiquidity = [makePool({ id: "low-liquidity", reserveIn: "100", reserveOut: "100", tvl: "200" })]

		expect(scoreRoute(highLiquidity)).toBeGreaterThan(scoreRoute(lowLiquidity))
	})
})

describe("AMM output", () => {
	it("calculates constant-product swap output", () => {
		const output = calculateSwapOutput("100", "1000", "1000", 30)

		expect(output).toBeCloseTo(90.661089388014, 12)
	})

	it("reduces output as fees increase", () => {
		const lowFee = calculateSwapOutput("100", "1000", "1000", 10)
		const highFee = calculateSwapOutput("100", "1000", "1000", 100)

		expect(lowFee).toBeGreaterThan(highFee)
	})

	it("returns zero for zero or invalid input", () => {
		expect(calculateSwapOutput("0", "1000", "1000", 30)).toBe(0)
		expect(calculateSwapOutput("100", "0", "1000", 30)).toBe(0)
		expect(calculateSwapOutput("100", "1000", "1000", 10000)).toBe(0)
	})

	it("handles large numbers deterministically", () => {
		const first = calculateSwapOutput("123456789.123456", "999999999999", "888888888888", 30)
		const second = calculateSwapOutput("123456789.123456", "999999999999", "888888888888", 30)

		expect(first).toBeGreaterThan(0)
		expect(first).toBe(second)
	})
})

describe("route validation", () => {
	it("validates a well-formed route", () => {
		const pools = generateMockPools()
		const route = [pools[0], pools[1]]

		expect(validateRoute(route, pools)).toEqual({ isValid: true, errors: [] })
	})

	it("rejects malformed and circular routes", () => {
		const pools = generateMockPools()
		const route = [pools[0], pools[1], pools[11]]
		const validation = validateRoute(route, pools)

		expect(validation.isValid).toBe(false)
		expect(validation.errors.some((error) => error.includes("circular"))).toBe(true)
	})
})

describe("route service integration", () => {
	it("generates a complete route response", async () => {
		const route = await routeService.findRoute(ASSETS.XLM, ASSETS.USDC, "100")

		expect(route.error).toBeUndefined()
		expect(route).toMatchObject({
			sourceAsset: ASSETS.XLM,
			destinationAsset: ASSETS.USDC,
			amount: "100",
			hopCount: 1,
		})
		expect(route.path).toHaveLength(1)
		expect(route.totalFee).toBeGreaterThan(0)
		expect(route.estimatedOutput).toBeGreaterThan(0)
		expect(route.minReceived).toBeLessThan(route.estimatedOutput)
		expect(route.efficiency).toBeGreaterThan(0)
	})

	it("generates a deterministic multi-hop route", async () => {
		const first = await routeService.findRoute(ASSETS.XLM, ASSETS.EURT, "100")
		const second = await routeService.findRoute(ASSETS.XLM, ASSETS.EURT, "100")

		expect(first.error).toBeUndefined()
		expect(first.hopCount).toBeGreaterThanOrEqual(2)
		expect(first.hopCount).toBeLessThanOrEqual(5)
		expect(first.path.map((hop) => hop.poolId)).toEqual(second.path.map((hop) => hop.poolId))
		expect(first.estimatedOutput).toBe(second.estimatedOutput)
	})

	it("returns a structured error for disconnected assets", async () => {
		const route = await routeService.findRoute(ASSETS.DEAD1, ASSETS.USDC, "100")

		expect(route.error).toEqual({
			code: "ROUTE_NOT_FOUND",
			messages: ["No route found"],
		})
		expect(route.path).toEqual([])
	})

	it("returns structured validation errors", async () => {
		const route = await routeService.findRoute(ASSETS.XLM, ASSETS.XLM, "0")

		expect(route.error.code).toBe("ROUTE_NOT_FOUND")
		expect(route.error.messages).toEqual([
			"Amount must be a positive number",
			"Source and destination assets must be different",
		])
	})

	it("completes route discovery in under one second", () => {
		const graph = buildPoolGraph(generateMockPools())
		const startedAt = Date.now()

		findPaths(graph, ASSETS.XLM, ASSETS.EURT)

		expect(Date.now() - startedAt).toBeLessThan(1000)
	})
})
