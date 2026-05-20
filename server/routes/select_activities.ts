import { Request, Response } from "express";
import { Firestore } from "firebase-admin/firestore";
import { Location, ActivitySlot } from "../../global_types";
import * as t from "../utils/tileUtils";
import * as a from "../utils/activitiesUtils";

const express = require('express');
const router  = express.Router();

router.post('/api/retrieve-activities', async (req: Request, res: Response) => {
    const { user_location, activity_types, distance } = req.body.data;
    const userLocation: Location = user_location;
    const db: Firestore = req.app.get('db');

    try {
        const types: string[] = (activity_types && activity_types.length > 0)
            ? activity_types
            : ["restaurant"];

        const searchRadiusInMiles = (distance && distance !== "any")
            ? parseFloat(distance)
            : 1;

        const searchRadius     = t.getMeters(searchRadiusInMiles);
        const tileLength       = t.getTileLength(searchRadius);
        const userTileLocation = t.findTileContainingLocation(userLocation, tileLength);
        const tileCollection   = t.getTileCollection(tileLength);
        const tilesInRadius    = t.findTilesInSearchRadius(userLocation, searchRadius, tileLength);

        const activitySlot: ActivitySlot = {
            start: { day: "Sunday", time: "00:00" },
            end:   { day: "Saturday", time: "23:59" },
            activity_types: types,
        };

        const allCached = await t.areAllTilesInCollection(tilesInRadius, tileCollection, db, types);

        let activities;
        if (allCached) {
            activities = await a.getActivitiesFromDB(userTileLocation.latlng, searchRadius, activitySlot, db);
            res.status(200).json({ msg: 'From cache', activities });
        } else {
            const fetched = await a.getActivitiesFromGoogleAPIRequest(userTileLocation.latlng, searchRadius, types);
            if (!fetched) { res.status(500).send('Google API request failed'); return; }
            await a.cacheActivities(fetched, db);
            activities = await a.getActivitiesFromDB(userTileLocation.latlng, searchRadius, activitySlot, db);
            res.status(201).json({ msg: 'From Google API', activities });
        }
    } catch (err) {
        console.error('retrieve-activities error:', err);
        res.status(500).send('Unable to retrieve activities.');
    }
});

module.exports = router;
