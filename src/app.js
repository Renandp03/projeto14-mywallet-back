import express from "express"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import cors from "cors"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid} from "uuid"
import Joi from "joi"
import dayjs from "dayjs"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

try {
    await mongoClient.connect()
} catch (error) {
    console.log(error.message)
}

db = mongoClient.db()



app.post("/users", async (req,res) =>{

    const {name, email, password} = req.body

    const userSchema = Joi.object({
        name:Joi.string().min(3).required(),
        email:Joi.string().email().required(),
        password:Joi.string().min(6).required()
    })

    const validation = userSchema.validate({name, email, password}, { abortEarly: false })

    if(validation.error)return res.status(422).send(validation.error.details)

    try {
        const emailExists = await db.collection("users").findOne({email})

        if(emailExists)return res.status(409).send("Dados indisponíveis")

        const hashPassword = bcrypt.hashSync(password,10)

        await db.collection("users").insertOne({name, email, password:hashPassword})

        res.status(201).send("ok")

    } catch (error) {
        console.log(error.message)
    }
   
})


app.get("/users", async (req,res) => {
    
    try {
        const users = await db.collection("users").find().toArray()
        res.send(users)
    } catch (error) {
        console.log(error.message)
    }
})

app.post("/sign-in", async (req,res) => {

    const {email, password} = req.body


    try {
        const user = await db.collection("users").findOne({email})

        const confirmPassword = bcrypt.compareSync(password,user.password)


        if(user && confirmPassword){

            const token = uuid()

            await db.collection("sessions").insertOne({id: user._id,token})

            return res.send(token)

        }
        else{return res.status(422).send("Dados incorretos")}

    } catch (error) {
        console.log(error.message)
    }

})

app.post("/informations", async (req,res) => {

    const { date, description, type, value } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    const dataInformationSchema = Joi.object({
        date:Joi.string().min(5).max(5).required(),
        description:Joi.string().max(20),
        type:Joi.string().valid("green","red"),
        value:Joi.string()
    })

    const validation = dataInformationSchema.validate({ date, description, type, value },{ abortEarly: false })

    if(validation.error) return res.status(400).send("dados inválidos")

    try {
        const session = await db.collection("sessions").findOne({token})

        if(!session) return res.status(401).send("Você não tem autorização para acessar esta página.")

        const userId = session.id

        const newInformation = {date, description, type, value:Number(value.replace(",",".")).toFixed(2), userId}
        
        await db.collection("informations").insertOne(newInformation)

        res.status(201).send(newInformation)

    } catch (error) {
        console.log(error.message)
    }

})

app.get("/informations", async (req,res) => {
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    try {
        const session = await db.collection("sessions").findOne({token})

        if(!session) return res.status(401).send("Você não tem autorização para acessar esta página.")

        const userId = session.id

        const user = await db.collection("users").findOne({_id:ObjectId(userId)})

        const informations = await db.collection("informations").find({userId}).toArray()

        res.send({informations, user})


    } catch (error) {
        console.log(error.message)
    }

})

const PORT = 5000
app.listen(PORT,() => console.log(`Rodando na porta ${PORT}`))