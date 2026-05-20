import { Location } from "../../global_types";
import firebase from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";

const utm = require('utm');

const ZONE_NUM = 18;
const ZONE_LETTER = 'N';

const timesSquareUTM = utm.fromLatLon(40.7588, -73.9851);

export type TileCoordinates = {
    tileX: number,
    tileY: number
}

export type TileLocation = {
    latlng: Location,
    coords: TileCoordinates,
}

export function findTileContainingLocation(location: Location, tileLength: number) {
    console.log('findTileContainingLocation:');

    const locationUTM = utm.fromLatLon(location.latitude, location.longitude);

    const tileX = Math.round((locationUTM.easting - timesSquareUTM.easting)/tileLength);
    const tileY = Math.round((locationUTM.northing - timesSquareUTM.northing)/tileLength);

    const EastingOffset = tileLength * tileX;
    const NorthingOffset = tileLength * tileY;
    
    const tileContainingLocationNorthing = timesSquareUTM.northing + NorthingOffset;
    const tileContainingLocationEasting = timesSquareUTM.easting + EastingOffset;
    console.log("Northing and Easting of user's tile: ");
    console.log("Easting: " + tileContainingLocationEasting);
    console.log("Northing: " + tileContainingLocationNorthing);

    const tileLocation: Location = utm.toLatLon(
        tileContainingLocationEasting, 
        tileContainingLocationNorthing,
        ZONE_NUM,
        ZONE_LETTER
    );

    const tileCoordinates: TileCoordinates = {
        tileX: tileX,
        tileY: tileY
    }

    const res: TileLocation = {latlng: tileLocation, coords: tileCoordinates};
    console.log("Contents of user's TileLocation: ", res);

    return res;
}

export function findTilesInSearchRadius(tileLocation: Location, radius: number, tileLength: number) {
    let tilesCoordinates: TileCoordinates[] = [];
    const tileLocationUTM = utm.fromLatLon(tileLocation.latitude, tileLocation.longitude);

    for (let i = 0; i < (2 * Math.round(radius/tileLength + 0.5) - 1); ++i ) {
        for (let j = 0; j < (2 * Math.round(radius/tileLength + 0.5) - 1); ++j) {
            let tileInRadiusEasting = tileLocationUTM.easting + (i - Math.floor(radius/tileLength)) * tileLength;
            let tileInRadiusNorthing = tileLocationUTM.northing + (j - Math.floor(radius/tileLength)) * tileLength;

            let distance = Math.sqrt((tileLocationUTM.easting - tileInRadiusEasting)**2 + (tileLocationUTM.northing - tileInRadiusNorthing)**2);
            if (distance <= radius) {
                const tileX = Math.round((tileInRadiusEasting - timesSquareUTM.easting)/tileLength);
                const tileY = Math.round((tileInRadiusNorthing - timesSquareUTM.northing)/tileLength);
                tilesCoordinates.push({tileX: tileX, tileY: tileY});
            }
        }
    }
    console.log('findTilesInSearchRadius:');
    console.log('For user with associated TileLocation of ', tileLocation);
    console.log('With search radius of ' + radius + ' and tile length of ' + tileLength);
    console.log('Tile coordinates in search radius are:');
    for (const tile of tilesCoordinates) {
        console.log(`(${tile.tileX},${tile.tileY})`);
    }
    return tilesCoordinates;
}

export function getTileLength(radius: number) {

    const maxTileLength = 8000;

    let tileLength = maxTileLength;
    const tileLengthCorrespondences = [
        {radiusLimit: 800, tileLength: 200},
        {radiusLimit: 1600, tileLength: 400},
        {radiusLimit: 3200, tileLength: 800},
        {radiusLimit: 6400, tileLength: 1600},
    ];

    for (let i = 0; i < 4; ++i) {
        if (radius <= tileLengthCorrespondences[i].radiusLimit) {
            tileLength = tileLengthCorrespondences[i].tileLength;
            break;
        }
    }

    console.log('getTileLength:')
    console.log('For search radius ' + radius + ' user was assigned tile length ' + tileLength);

    return tileLength;
}

export function getTileCollection(tileLength: number) {
    switch(tileLength) {
        case 200:
            return 'tiles-precision-5';
        case 400:
            return 'tiles-precision-4';
        case 800:
            return 'tiles-precision-3';
        case 1600:
            return 'tiles-precision-2';
        case 8000:
            return 'tiles-precision-1';
        default: throw new Error(`Unsupported tileLength: ${tileLength}`);
    }
}

export async function areAllTilesInCollection(tilesCoordinates: TileCoordinates[], tileCollection: string, db: Firestore, activitiesRequested: string[]) {
    const { FieldValue, Timestamp } = await import('firebase-admin/firestore');
    console.log('areAllTilesInCollection:');
    let allTilesAreInCollection = true;
    const tileCollectionRef = db.collection(tileCollection);
    const currentTimestamp = Date.now();
    console.log('Checking if tiles are in table...');
    for (const tile of tilesCoordinates) {
        const snapshot = await tileCollectionRef
            .where('coord_x', '==', tile.tileX)
            .where('coord_y', '==', tile.tileY)
            .where('activity_types', 'array-contains-any', activitiesRequested)
            .get();

        if (snapshot.empty || isTileExpired(currentTimestamp, snapshot.docs[0].data().last_accessed.toMillis())) {
            allTilesAreInCollection = false;
            await tileCollectionRef.doc(`${tile.tileX}_${tile.tileY}`).set({
                coord_x: tile.tileX,
                coord_y: tile.tileY,
                last_accessed: Timestamp.now(),
                activity_types: FieldValue.arrayUnion(...activitiesRequested),
            }, { merge: true });
        }
    }
    console.log('returned ' + allTilesAreInCollection);
    return allTilesAreInCollection;
}

export function isTileExpired(currentTimestamp: number, tileTimestamp: number) {

    const msPerDay = 1000 * 60 * 60 * 24;

    const expirationTimeInDays = 183;
    const timeDifferenceInDays = (currentTimestamp - tileTimestamp) / msPerDay;
    if (timeDifferenceInDays <= expirationTimeInDays) {
        return false;
    }
    else {
        return true;
    }
}

export function getMeters(miles: number) {
    return miles*1609.344;
}