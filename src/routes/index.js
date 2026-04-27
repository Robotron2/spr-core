const express = require("express")
const router = express.Router()

const accountRoutes = require("./account.routes")
const transactionRoutes = require("./transaction.routes")
const sorobanRoutes = require("./soroban.routes")

router.use("/account", accountRoutes)
router.use("/transaction", transactionRoutes)
router.use("/soroban", sorobanRoutes)

router.get("/health", (req, res) => {
	res.json({ status: "ok", timestamp: new Date() })
})

module.exports = router
