import { Request, Response } from "express";
import { Firestore } from "firebase-admin/firestore";
import { ActivitySlot } from "../../global_types";
import { getNormalizedTimeFromFormattedTime } from "../utils/activitiesUtils";

const express = require('express');
const router  = express.Router();

router.post('/api/add-profile-data', async (req: Request, res: Response) => {
    const userID: string           = req.body.data.user_id;
    const profileData: ActivitySlot[] = JSON.parse(req.body.data.profileData);
    const db: Firestore            = req.app.get('db');

    const bulkWriter = db.bulkWriter();
    for (const activitySlot of profileData) {
        activitySlot.start.normalized_time = getNormalizedTimeFromFormattedTime(activitySlot.start.day, activitySlot.start.time);
        activitySlot.end.normalized_time   = getNormalizedTimeFromFormattedTime(activitySlot.end.day, activitySlot.end.time);
        const docID  = `${userID}_${activitySlot.start.day}_${activitySlot.start.time}_${activitySlot.end.day}_${activitySlot.end.time}`;
        const docRef = db.collection('activity_slots').doc(docID);
        const wrapsAround = activitySlot.start.normalized_time > activitySlot.end.normalized_time;
        bulkWriter.set(docRef, { user_id: userID, wraps: wrapsAround, ...activitySlot }, { merge: true });
    }
    try {
        await bulkWriter.close();
        res.status(200).send('Added profile data to profile');
    } catch (err) {
        console.error('Error adding profile data:', err);
        res.status(500).send('Was unable to add profile data to profile.');
    }
});

module.exports = router;
