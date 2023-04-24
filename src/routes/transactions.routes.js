import { Router } from "express";
import { getTransactions, makeTransaction } from "../controllers/transactions.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { transactionSchem } from "../schemas/transaction.schema.js";
import { authValidation } from "../middlewares/auth.middleware.js";

const transactionsRouter = Router();

transactionsRouter.use(authValidation)

transactionsRouter.post("/transaction", validateSchema(transactionSchem), makeTransaction)
transactionsRouter.get("/transaction", getTransactions)

export default transactionsRouter;