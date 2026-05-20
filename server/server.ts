import { applicationDefault, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const express = require('express');
const cors    = require('cors');
const app  = express();
const port = 3001;

const signinRouter           = require('./routes/signin');
const profileCreationRouter  = require('./routes/profile_creation');
const selectActivitiesRouter = require('./routes/select_activities');

const firebase = initializeApp({ credential: applicationDefault() });
const db   = getFirestore(firebase);
const auth = getAuth(firebase);

app.set('db',   db);
app.set('auth', auth);

app.use(cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

app.use('/signin',            signinRouter);
app.use('/profile_creation',  profileCreationRouter);
app.use('/select_activities', selectActivitiesRouter);

app.listen(port, () => {
    console.log(`Webserver listening on port ${port}`);
    console.log(`Connect to Webserver: http://localhost:${port}`);
});
