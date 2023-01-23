import { postSing_in, getUsers, postUsers } from "../controller/Auth.js"
import { Router } from "express"
import { validateSchema } from "../middleware/validateSchema.js"
import { userSchema } from "../model/AuthSchema.js"

const authRouter = Router()


authRouter.post("/sign-in",postSing_in)

authRouter.get("/users", getUsers)

authRouter.post("/users",validateSchema(userSchema),postUsers)

export default authRouter