const { validateAccountId, validateAmount, validateAsset } = require("../validators")

describe("validators", () => {
	describe("validateAsset", () => {
		it("accepts a non-empty asset string", () => {
			expect(validateAsset("native")).toBe(true)
		})

		it("rejects missing or non-string assets", () => {
			expect(() => validateAsset()).toThrow("Invalid asset format")
			expect(() => validateAsset({ code: "USDC" })).toThrow("Invalid asset format")
		})
	})

	describe("validateAmount", () => {
		it("accepts a positive numeric amount", () => {
			expect(validateAmount("10.5")).toBe(true)
		})

		it("rejects zero, negative, and non-numeric amounts", () => {
			expect(() => validateAmount("0")).toThrow("Amount must be a positive number")
			expect(() => validateAmount("-1")).toThrow("Amount must be a positive number")
			expect(() => validateAmount("abc")).toThrow("Amount must be a positive number")
		})
	})

	describe("validateAccountId", () => {
		it("accepts account ids that start with G", () => {
			expect(validateAccountId("GABCDEFGHIJKLMNOPQRSTUVWXYZ")).toBe(true)
		})

		it("rejects missing account ids and ids that do not start with G", () => {
			expect(() => validateAccountId()).toThrow("Invalid Stellar account ID")
			expect(() => validateAccountId("SABCDEFGHIJKLMNOPQRSTUVWXYZ")).toThrow("Invalid Stellar account ID")
		})
	})
})
