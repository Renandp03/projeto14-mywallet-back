import { getInformations, postInformations } from "../controller/Informations.js"
import { Router } from "express"

const infoRouter = Router()



infoRouter.get("/informations", getInformations)

infoRouter.post("/informations", postInformations)

export default infoRouter