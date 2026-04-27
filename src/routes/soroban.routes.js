const express = require("express")
const router = express.Router()
const sorobanController = require("../controllers/soroban.controller")

router.post("/invoke", sorobanController.invokeContract)
router.get("/read/:contractId/:key", sorobanController.readContractData)

module.exports = router
