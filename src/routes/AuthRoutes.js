import { postSing_in, getUsers, postUsers } from "../controller/Auth.js"
import { Router } from "express"

const authRouter = Router()


authRouter.post("/sign-in",postSing_in)

authRouter.get("/users", getUsers)

authRouter.post("/users",postUsers)

export default authRouter