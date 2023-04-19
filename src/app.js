import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import joi from "joi";
import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import {v4 as uuid} from "uuid";

//Create server app ===========
const app = express();

//Config ======================
app.use(cors());
app.use(express.json());
dotenv.config();
const PORT = 5000;
//Connect to database =========
const mongoClient = new MongoClient(process.env.DATABASE_URL)
try {
    await mongoClient.connect();
    console.log("MongoDB conectado!");
} catch (err) {
    console.log(err.message);
}

const db = mongoClient.db();
console.log(db)
//Schemas ====================


//Endpoints ==================
app.post("/sign-up", async (req, res) => {
    const { name, email, password } = req.body;

    const singUpSchem = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().min(3).required()
    })

    const validation = singUpSchem.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const user = await db.collection("users").findOne({ email });
        if (user) return res.status(409).send("E-mail já cadastrado");

        const hash = bcrypt.hashSync(password, 10);

        await db.collection("users").insertOne({ name, email, password: hash });
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const signInSchem = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    })

    const validation = signInSchem.validate(req.body, {abortEarly: false});
    if(validation.error){
        const errors = validation.error.details.map((detail) => detail.message);
        return res.status(422).send(errors);
    }

    try {
        const user = await db.collection("users").findOne({email});
        if(!user) return res.status(404).send("E-mail não cadastrado.")
        
        const correctPassword = bcrypt.compareSync(password, user.password);
        if(!correctPassword) return res.status(401).send("Senha incorreta");
        
        const token = uuid();
        const userHaveToken = await db.collection("sessions").findOne({userId: user._id});
        if(!userHaveToken) await db.collection("sessions").insertOne({token, userId: user._id});
        
        else await db.collection("sessions").updateOne({userId: user._id},{$set: {token}});

        res.status(200).send(token);
    } catch (err) {
        res.status(500).send(err.message)
    }
})



app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))