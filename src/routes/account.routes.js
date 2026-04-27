const express = require("express")
const router = express.Router()
const accountController = require("../controllers/account.controller")

router.get("/:id", accountController.getAccount)
router.post("/", accountController.createAccount)

module.exports = router
