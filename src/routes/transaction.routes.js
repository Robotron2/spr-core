const express = require("express")
const router = express.Router()
const transactionController = require("../controllers/transaction.controller")

router.get("/:id", transactionController.getTransaction)
router.post("/", transactionController.createTransaction)
router.post("/submit", transactionController.submitTransaction)

module.exports = router
