import express from "express"
import { MongoClient, ObjectId } from "mongodb"
import dotenv from "dotenv"
import cors from "cors"
import joi from "joi"
import bcrypt from "bcrypt"
import { v4 as uuid} from "uuid"

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
const usersCollection = db.collection("users")
const informationsColection = db.collection("informations")


app.post("/users", async (req,res) =>{
    const {name, email, password} = req.body


    
    try {

        const emailExists = usersCollection.find({email})

        if(emailExists){return res.status(409).send("Dados indisponíveis")}

        await usersCollection.insertOne({ name, email, password })

    } catch (error) {
        console.log(error.message)
    }
    res.send("ok")
})


app.get("/users", async (req,res) => {
    
    try {
        const users = await usersCollection.find().toArray()
        res.send(users)
    } catch (error) {
        console.log(error.message)
    }
})

app.get("/informations", async (req,res) => {
    
})

const PORT = 5000
app.listen(PORT,() => console.log(`Rodando na porta ${PORT}`))