import { Router } from "express";
import { login, signUp } from "../controllers/users.controller.js";
import { validateSchema } from "../middlewares/validateSchema.middleware.js";
import { signUpSchem, signInSchem } from "../schemas/users.schema.js";

const usersRouter = Router();

usersRouter.post("/sign-up", validateSchema(signUpSchem), signUp)
usersRouter.post("/login", validateSchema(signInSchem), login)

export default usersRouter;