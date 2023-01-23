import { ObjectId } from "mongodb"
import db from "../config/Database.js"
import { dataInformationSchema } from "../model/InformationsSchema.js"

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


function validation(schema,data){
    
        const { error } = schema.validate(data,{ abortEarly: false })

        if(error) return error.details.map((err) => err.message)
    }


export async function postInformations(req,res){

    const { date, description, type, value } = req.body
    const { authorization } = req.headers
    const token = authorization?.replace('Bearer ', '')

    const error = validation(dataInformationSchema,{ date, description, type, value })

    if(error)return res.status(422).send(error)


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