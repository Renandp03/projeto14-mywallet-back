import { getInformations, postInformations } from "../controller/Informations.js"
import { Router } from "express"
import { dataInformationSchema } from "../model/InformationsSchema.js"
import { validateSchema } from "../middleware/validateSchema.js"

const infoRouter = Router()



infoRouter.get("/informations", getInformations)

infoRouter.post("/informations", validateSchema(dataInformationSchema),postInformations)

export default infoRouter