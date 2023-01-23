import { ObjectId } from "mongodb"
import Joi from "joi"
import db from "../config/Database.js"



export async function getInformations(req,res){
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    try {
        const session = await db.collection("sessions").findOne({token})

        if(!session) return res.status(401).send("Você não tem autorização para acessar esta página.")

        const userId = session.id

        const user = await db.collection("users").findOne({_id:ObjectId(userId)})

        const informations = await db.collection("informations").find({userId}).toArray()

        informations.reverse()

        res.send({informations, user})


    } catch (error) {
        console.log(error.message)
    }

}

export async function postInformations(req,res){

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

        const user = await db.collection("users").findOne({_id:ObjectId(userId)})

        const newInformation = {date, description, type, value:Number(value.replace(",",".")).toFixed(2), userId}

        if(newInformation.type === "green"){
            await db.collection("users").updateOne({_id:ObjectId(userId)},{$set:{cash:Number(user.cash) + Number(newInformation.value)}})
        }
        else{
            await db.collection("users").updateOne({_id:ObjectId(userId)},{$set:{cash:(Number(user.cash) - Number(newInformation.value)).toFixed(2)}})
        }
        
        await db.collection("informations").insertOne(newInformation)

        res.status(201).send(newInformation)

    } catch (error) {
        console.log(error.message)
    }

}