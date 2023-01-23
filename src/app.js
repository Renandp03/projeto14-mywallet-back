import express from "express"
import cors from "cors"
import authRouter from "./routes/AuthRoutes.js"
import infoRouter from "./routes/InformationsRoutes.js"

const app = express()
app.use(cors())
app.use(express.json())

app.use(authRouter)
app.use(infoRouter)

const PORT = 5000
app.listen(PORT,() => console.log(`Rodando na porta ${PORT}`))

