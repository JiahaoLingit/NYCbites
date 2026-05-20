import { Request, Response } from "express";
import { Firestore, Filter } from "firebase-admin/firestore";
import { Auth } from "firebase-admin/auth";

const express = require('express');
const router  = express.Router();

router.post('/api/signup-email', async (req: Request, res: Response) => {
    const username: string = req.body.data.username;
    const email: string    = req.body.data.email;
    const db: Firestore    = req.app.get('db');
    const usersCollectionRef = db.collection('users');

    const existingUser = await usersCollectionRef
        .where(Filter.or(Filter.where('email', '==', email), Filter.where('username', '==', username)))
        .limit(1).get();

    if (!existingUser.size) {
        try {
            const password: string = req.body.data.password;
            const auth: Auth = req.app.get('auth');
            const newUser    = await auth.createUser({ email, password, displayName: username });
            const tokenJWT   = await auth.createCustomToken(newUser.uid);
            res.status(200).send({ msg: 'Created an account.', token: tokenJWT });
        } catch (err) {
            console.error('Error creating profile:', err);
            res.status(501).send('Something went wrong when creating account.');
        }
    } else {
        res.status(500).send('Email or username already exists.');
    }
});

module.exports = router;
