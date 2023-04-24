import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";

export async function makeTransaction(req, res) {
    const { value, type, description } = req.body;
    const fixedValue = Number(value).toFixed(2);

    try {
        const session = res.locals.session
        await db.collection("transactions").insertOne({ userId: session.userId, value: fixedValue, description, date: dayjs().format("DD/MM"), type });

        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
}

export async function getTransactions(req, res) {
    try {
        const session = res.locals.session;

        const username = await db.collection("users").findOne({ _id: new ObjectId(session.userId) })
        const transactionHistory = await db.collection("transactions").find({ userId: session.userId }).toArray();

        res.send({
            username: username.name,
            transactions: transactionHistory.reverse()
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
}