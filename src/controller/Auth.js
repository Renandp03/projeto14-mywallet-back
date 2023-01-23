import bcrypt from "bcrypt"
import { v4 as uuid} from "uuid"
import db from "../config/Database.js"





export async function getUsers(req,res){
    
    try {
        const users = await db.collection("users").find().toArray()
        res.send(users)
    } catch (error) {
        console.log(error.message)
    }
}

export  async function postUsers(req,res){

    const {name, email, password} = req.body

    const validation = userSchema.validate({name, email, password}, { abortEarly: false })

    if(validation.error)return res.status(422).send(validation.error.details)

    try {
        const emailExists = await db.collection("users").findOne({email})

        if(emailExists)return res.status(409).send("Dados indisponíveis")

        const hashPassword = bcrypt.hashSync(password,10)

        await db.collection("users").insertOne({name, email, password:hashPassword,cash:0})

        res.status(201).send("ok")

    } catch (error) {
        console.log(error.message)
    }
   
}

export async function postSing_in(req,res){

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

}