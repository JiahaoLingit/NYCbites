import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const express = require('express');
const cors    = require('cors');
const app  = express();
const port = process.env.PORT ?? 3001;

const signinRouter           = require('./routes/signin');
const profileCreationRouter  = require('./routes/profile_creation');
const selectActivitiesRouter = require('./routes/select_activities');

function initFirebase() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        return initializeApp({ credential: cert(serviceAccount) });
    }
    const { applicationDefault } = require('firebase-admin/app');
    return initializeApp({ credential: applicationDefault() });
}

const firebase = initFirebase();
const db   = getFirestore(firebase);
const auth = getAuth(firebase);

app.set('db',   db);
app.set('auth', auth);

app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());

app.use('/signin',            signinRouter);
app.use('/profile_creation',  profileCreationRouter);
app.use('/select_activities', selectActivitiesRouter);

app.listen(port, () => {
    console.log(`Webserver listening on port ${port}`);
});
