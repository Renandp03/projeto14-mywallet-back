import express from "express"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import cors from "cors"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid} from "uuid"
import Joi from "joi"

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
        name:Joi.string().min(3),
        email:Joi.string().email(),
        password:Joi.string().min(6)
    })

    const validation = userSchema.validate({name, email, password}, { abortEarly: false })

    if(validation.error)return res.status(422).send(validation.error.details)

    try {
        const emailExists = await db.collection("users").findOne({name})

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
        const users = await usersCollection.find().toArray()
        res.send(users)
    } catch (error) {
        console.log(error.message)
    }
})

app.post("/sign-in", async (req,res) => {

    const {email, password} = req.body

    console.log(req.body)


    try {
        const user = await db.collection("users").findOne({email})

        const confirmPassword = bcrypt.compareSync(password,user.password)


        if(user && confirmPassword){

            const token = uuid()

            await db.collection("sessions").insertOne({
                id: user._id,
                token
            })

            return res.send(token)

        }
        else{return res.status(422).send("Dados incorretos")}

    } catch (error) {
        console.log(error.message)
    }

})

app.post("/informations", async (req,res) => {

})

app.get("/informations", async (req,res) => {

})

const PORT = 5000
app.listen(PORT,() => console.log(`Rodando na porta ${PORT}`))