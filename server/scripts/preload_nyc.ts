
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as a from '../utils/activitiesUtils';

const firebase = initializeApp({ credential: applicationDefault() });
const db = getFirestore(firebase);

const NYC_BOROUGHS = [
    {
        name: "Manhattan",
        latMin: 40.6980, latMax: 40.8820,
        lngMin: -74.0200, lngMax: -73.9070,
    },
    {
        name: "Brooklyn",
        latMin: 40.5700, latMax: 40.7390,
        lngMin: -74.0420, lngMax: -73.8330,
    },
    {
        name: "Queens",
        latMin: 40.5420, latMax: 40.8000,
        lngMin: -73.9620, lngMax: -73.7000,
    },
    {
        name: "Bronx",
        latMin: 40.7850, latMax: 40.9160,
        lngMin: -73.9330, lngMax: -73.7650,
    },
    {
        name: "Staten Island",
        latMin: 40.4960, latMax: 40.6510,
        lngMin: -74.2590, lngMax: -74.0340,
    },
];

const SEARCH_RADIUS_METERS = 800;
const GRID_STEP_LAT = 0.008;
const GRID_STEP_LNG = 0.011;

const RESTAURANT_TYPES = ['restaurant', 'fast_food_restaurant', 'cafe', 'bar'];

function generateGrid(borough: typeof NYC_BOROUGHS[0]) {
    const points: { lat: number; lng: number }[] = [];
    for (let lat = borough.latMin; lat <= borough.latMax; lat += GRID_STEP_LAT) {
        for (let lng = borough.lngMin; lng <= borough.lngMax; lng += GRID_STEP_LNG) {
            points.push({
                lat: Math.round(lat * 10000) / 10000,
                lng: Math.round(lng * 10000) / 10000,
            });
        }
    }
    return points;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function preload() {
    console.log('\n🗽 NYC Restaurant Full Coverage Preloader');
    console.log('=========================================\n');

    let totalPoints = 0;
    let totalCached = 0;
    let totalDuplicates = 0;
    const allSeenIds = new Set<string>();

    for (const borough of NYC_BOROUGHS) {
        const grid = generateGrid(borough);
        totalPoints += grid.length;
        console.log(`📍 ${borough.name}: ${grid.length} grid points`);
    }

    console.log(`\n📊 Total grid points: ${totalPoints}`);
    console.log(`⏱  Estimated time: ${Math.ceil(totalPoints * 1.2 / 60)} minutes\n`);
    console.log('Starting in 3 seconds...\n');
    await sleep(3000);

    for (const borough of NYC_BOROUGHS) {
        const grid = generateGrid(borough);
        console.log(`\n── ${borough.name} (${grid.length} points) ──`);

        let boroughCached = 0;

        for (let i = 0; i < grid.length; i++) {
            const point = grid[i];
            const progress = `[${i + 1}/${grid.length}]`;

            try {
                const location = { latitude: point.lat, longitude: point.lng };
                const activities = await a.getActivitiesFromGoogleAPIRequest(
                    location,
                    SEARCH_RADIUS_METERS,
                    RESTAURANT_TYPES
                );

                if (activities && activities.length > 0) {

                    const newActivities = activities.filter(act => !allSeenIds.has(act.activityID));
                    const dupes = activities.length - newActivities.length;
                    totalDuplicates += dupes;

                    if (newActivities.length > 0) {
                        await a.cacheActivities(newActivities, db);
                        newActivities.forEach(act => allSeenIds.add(act.activityID));
                        boroughCached += newActivities.length;
                        totalCached += newActivities.length;
                        process.stdout.write(`${progress} +${newActivities.length} new (${dupes} dupes) | total: ${totalCached}\n`);
                    } else {
                        process.stdout.write(`${progress} all dupes, skipping\n`);
                    }
                } else {
                    process.stdout.write(`${progress} no results\n`);
                }

                await sleep(1200);

            } catch (err: any) {
                if (err?.response?.status === 429) {
                    console.log(`\n⚠ Rate limited! Waiting 30 seconds...`);
                    await sleep(30000);
                    i--;
                } else {
                    console.error(`${progress} Error:`, err?.message ?? err);
                    await sleep(1200);
                }
            }
        }

        console.log(`✓ ${borough.name} done: ${boroughCached} new restaurants\n`);
    }

    console.log('\n=========================================');
    console.log(`✅ Preload complete!`);
    console.log(`   Total unique restaurants: ${totalCached}`);
    console.log(`   Duplicates skipped: ${totalDuplicates}`);
    console.log(`   Coverage: all 5 NYC boroughs`);
    console.log('=========================================\n');
    process.exit(0);
}

preload().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
