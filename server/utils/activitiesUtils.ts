import { Filter, Firestore } from "firebase-admin/firestore";
import { Activity, ActivitySlot, Location, OperatingHours, PriceRange } from "../../global_types";
import haversineDistance from "haversine-distance";
import axios from "axios"; 
import { getNormalizedTime } from "../../common_utils";

type BoundingCoords = {
    topRight: Location,
    bottomLeft: Location
}

const utm = require('utm');

export async function getActivitiesFromGoogleAPIRequest(location: Location, radius: number, requestedActivities: string[]) {
    console.log('getActivitiesFromGoogleAPIRequest:');
    try {
        const apiUri = 'https://places.googleapis.com/v1/places:searchNearby';
        const fieldMask =
            'places.id,' +
            'places.accessibilityOptions,' +
            'places.displayName,' +
            'places.types,' +
            'places.regularOpeningHours,' +
            'places.rating,' +
            'places.userRatingCount,' +
            'places.priceLevel,' +
            'places.priceRange,' +
            'places.websiteUri,' +
            'places.nationalPhoneNumber,' +
            'places.location,' +
            'places.googleMapsLinks,' +
            'places.formattedAddress,' +
            'places.shortFormattedAddress,' +
            'places.photos,';

        const BATCH_SIZE = 5;
        const allPlaces: any[] = [];
        const seenIds = new Set<string>();

        const typesToSearch = requestedActivities.length > 0
            ? requestedActivities
            : ['restaurant', 'fast_food_restaurant', 'cafe', 'bar', 'pizza_restaurant'];

        for (let i = 0; i < typesToSearch.length; i += BATCH_SIZE) {
            const batch = typesToSearch.slice(i, i + BATCH_SIZE);
            try {
                const res = await axios.post(
                    apiUri,
                    {
                        includedTypes: batch,
                        maxResultCount: 20,
                        rankPreference: 'DISTANCE',
                        locationRestriction: {
                            circle: {
                                center: {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                },
                                radius: radius,
                            }
                        },
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
                            'X-Goog-FieldMask': fieldMask,
                        }
                    }
                );

                const places = res.data.places ?? [];
                for (const place of places) {
                    if (!seenIds.has(place.id)) {
                        seenIds.add(place.id);
                        allPlaces.push(place);
                    }
                }
            } catch (batchErr) {
                console.error(`Batch request failed for types ${batch}:`, batchErr);
            }
        }

        if (requestedActivities.length === 0 || allPlaces.length < 20) {
            try {
                const res = await axios.post(
                    apiUri,
                    {
                        includedTypes: ['restaurant'],
                        maxResultCount: 20,
                        rankPreference: 'POPULARITY',
                        locationRestriction: {
                            circle: {
                                center: {
                                    latitude: location.latitude,
                                    longitude: location.longitude,
                                },
                                radius: radius,
                            }
                        },
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Goog-Api-Key': process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY,
                            'X-Goog-FieldMask': fieldMask,
                        }
                    }
                );
                const places = res.data.places ?? [];
                for (const place of places) {
                    if (!seenIds.has(place.id)) {
                        seenIds.add(place.id);
                        allPlaces.push(place);
                    }
                }
            } catch (err) {
                console.error('Extra restaurant request failed:', err);
            }
        }

        console.log(`Total unique places retrieved: ${allPlaces.length}`);

        if (allPlaces.length === 0) {
            throw new Error("User's request yielded no results");
        }

        const activities = convertPlacesToActivities({ data: { places: allPlaces } });
        console.log('Retrieved activities: ', activities);
        return activities;
    } catch (err) {
        console.error('Error retrieving activities from Google Places:', err);
    }
}

export async function cacheActivities(activities: Activity[], db: Firestore) {
    const bulkWriter = db.bulkWriter();
    for (const activity of activities) {
        const docID = activity.activityID;
        const docRef = db
            .collection('activities')
            .doc(docID);
        const activityData = formatActivityToDB(activity);
        bulkWriter.set(docRef, activityData, {merge: true});
    }
    try {
        console.log('Attempting to add activities to activities table')
        await bulkWriter.close();
    } catch (err) {
        console.error('Error adding activities to activities table:', err);
    }
}

export async function getActivitiesFromDB(location: Location, radius: number, activitySlot: ActivitySlot, db: Firestore) {
    console.log('getActivitiesFromDB:');
    try {
        let activities: Activity[] = [];
        const boundingCoords: BoundingCoords = getBoundingCoords(location, radius);

        console.log('Attempting to get activities from the DB');
        const snapshot = await db.collection('activities')
            .where('location.latitude', '<=', boundingCoords.topRight.latitude)
            .where('location.latitude', '>=', boundingCoords.bottomLeft.latitude)
            .where('location.longitude', '<=', boundingCoords.topRight.longitude)
            .where('location.longitude', '>=', boundingCoords.bottomLeft.longitude)
            .where('types', 'array-contains-any', activitySlot.activity_types)
            .get();
        
        console.log('Successfully got activities from DB');
        console.log('Now, selecting viable candidates');
        for (const doc of snapshot.docs) {
            const activity = doc.data();

            if (haversineDistance(location, activity.location) <= radius) {
                if (activity?.open_hours) {
                    const currentOpening = getCurrentOpeningOfActivity(activity.open_hours);
                    if (currentOpening) {
                        Object.defineProperty(activity, 'current_opening', {
                            value: currentOpening,
                            writable: true, configurable: true,
                        });
                    } else {
                        const nextOpening = getNextOpeningOfActivity(activity.open_hours, activitySlot);
                        if (nextOpening) {
                            Object.defineProperty(activity, 'next_opening', {
                                value: nextOpening,
                                writable: true, configurable: true,
                            });
                        }
                    }
                }
                activities.push(formatActivityFromDB(activity));
            }
        }
        console.log('Finished getting all activities in range');
        return activities;
    } catch(err) {
        console.error('Unable to retrieve activities from the DB', err);
    }
    
}

export async function getCurrentActivitySlot(userID: string, db: Firestore){
    console.log('getCurrentActivitySlot:');
    console.log('User ID of requesting user: ', userID);    
    const userDoc = await db.collection('users').doc(userID).get();
    if (userDoc.exists) {
        const currentDate = new Date();
        const currentTimeNormalized = getNormalizedTime(currentDate.getDay(), currentDate.getHours(), currentDate.getMinutes());
        
        const activitySlots = userDoc.data()?.activity_slots;
        const currentSlot = activitySlots.filter((slot: any) => {
            return (
                (
                    slot.wrap === false && 
                    slot.start.normalized_time <= currentTimeNormalized &&
                    slot.end.normalized_time >= currentTimeNormalized
                ) || 
                (
                    slot.wrap === true && 
                    (
                        slot.start.normalized_time <= currentTimeNormalized ||
                        slot.end.normalized_time >= currentTimeNormalized
                    )
                )
            )
        })

        if (currentSlot.length === 0) {
            return null;
        }

        delete currentSlot[0].wrap;
        return currentSlot[0] as ActivitySlot;
    }
    
}

export async function getSearchRadius(userID: string, db: Firestore){  
    const userDoc = await db.collection('users').doc(userID).get();
    if (userDoc.exists) {
        return userDoc.data()?.distance;
    }
}

export function getBoundingCoords(location: Location, radius: number) {

    const locationUTM = utm.fromLatLon(location.latitude, location.longitude);
    const northing = locationUTM.northing;
    const easting = locationUTM.easting;
    const zoneNum = locationUTM.zoneNum;
    const zoneLetter = locationUTM.zoneLetter;

    const boundingBox: BoundingCoords = {
        topRight: utm.toLatLon(easting + radius, northing + radius, zoneNum, zoneLetter),
        bottomLeft: utm.toLatLon(easting - radius, northing - radius, zoneNum, zoneLetter),
    }

    return boundingBox;
}

export function getCurrentFormattedTime() {
    const currentDate = new Date();
    return getFormattedTime(currentDate.getDay(), currentDate.getHours(), currentDate.getMinutes());
}

export function getFormattedTime(day: number, hours: number, minutes: number) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedDay = dayNames[day];
    const formattedTime = 
        (hours.toString().length === 1 ? '0' + hours : hours.toString()) + ':' + 
        (minutes.toString().length === 1 ? '0' + minutes : minutes.toString());

    return {day: formattedDay, time: formattedTime};
}

export function isActivityInAvailabilitySlot(openHours: OperatingHours[] | undefined, activitySlot: ActivitySlot) {
    if (!openHours) {
        return true;
    }

    if (activitySlot.start.normalized_time! < activitySlot.end.normalized_time!) {
        return openHours.some(({ opening, closing }) =>
            opening.normalized_time! <= activitySlot.end.normalized_time! &&
            closing.normalized_time! >= activitySlot.start.normalized_time!
        );
    }

    else {
        return openHours.some(({ opening, closing }) =>
            opening.normalized_time! <= activitySlot.end.normalized_time! ||
            closing.normalized_time! >= activitySlot.start.normalized_time!
        );
    }
}

export function getCurrentOpeningOfActivity(openHours: OperatingHours[]) {
    const currentDate = new Date();
    const currentTimeNormalized = getNormalizedTime(currentDate.getDay(), currentDate.getHours(), currentDate.getMinutes());
    return openHours.find(({ opening, closing }) => {
        if (opening.normalized_time! < closing.normalized_time!) {
            return (
                opening.normalized_time! <= currentTimeNormalized &&
                closing.normalized_time! >= currentTimeNormalized
            );
        } 
        else {
            return (
                opening.normalized_time! <= currentTimeNormalized ||
                closing.normalized_time! >= currentTimeNormalized
            );
        }
    });
}

export function getNextOpeningOfActivity(openHours: OperatingHours[], activitySlot: ActivitySlot) {
    const currentDate = new Date();
    const currentTimeNormalized = getNormalizedTime(currentDate.getDay(), currentDate.getHours(), currentDate.getMinutes());

    if (activitySlot.start.normalized_time! < activitySlot.end.normalized_time!) {
        return openHours.find(({ opening }) =>
            opening.normalized_time! > currentTimeNormalized &&
            opening.normalized_time! < activitySlot.end.normalized_time!
        );
    }
    else {
        return openHours.find(({ opening }) =>
            opening.normalized_time! > currentTimeNormalized ||
            opening.normalized_time! < activitySlot.end.normalized_time!
        );
    }
}

export function formatActivityFromDB(activityDoc: FirebaseFirestore.DocumentData) {
    if (activityDoc?.open_hours){
        for (const period of activityDoc.open_hours) {
            delete period.opening.normalized_time;
            delete period.closing.normalized_time;
        }
    }

    const activity: Activity = {

        activityID: activityDoc.id as string,
        activityName: activityDoc.name as string,
        types: activityDoc.types as string[],
        address: activityDoc.address as string,
        longAddress: activityDoc.long_address as string,
        location: activityDoc.location as Location,

        ...(activityDoc?.website_uri && {websiteUri: activityDoc.website_uri as string}),
        ...(activityDoc?.reviews_uri && {reviewsUri: activityDoc.reviews_uri as string}),
        ...(activityDoc?.directions_uri && {directionsUri: activityDoc.directions_uri as string}),
        ...(activityDoc?.photos_uri && {photosUri: activityDoc.photos_uri as string}),
        ...(activityDoc?.phone_number && {phoneNumber: activityDoc.phone_number as string}),
        ...(activityDoc?.rating && {rating: activityDoc.rating as number}),
        ...(activityDoc?.ratings_count && {ratingsCount: activityDoc.ratings_count as number}),
        ...(activityDoc?.accessibility_options && {accessibilityOptions: activityDoc.accessibility_options as string[]}),
        ...(activityDoc?.open_hours && {openHours: activityDoc.open_hours as OperatingHours[]}),
        ...(activityDoc?.current_opening && {currentOpening: activityDoc.current_opening as OperatingHours}),
        ...(activityDoc?.next_opening && {nextOpening: activityDoc.next_opening as OperatingHours}),
        ...(activityDoc?.price_level && {priceLevel: activityDoc.price_level as number}),
        ...(activityDoc?.price_range && {priceRange: {
            startPrice: activityDoc.price_range.start_price,  
            ...(activityDoc.price_range?.end_price && { endPrice: activityDoc.price_range.end_price }),
        } as PriceRange})
    };
    return activity;
}

export function formatActivityToDB(activity: Activity) {
    const activityDocData = {

        id: activity.activityID,
        name: activity.activityName,
        types: activity.types,
        address: activity.address,
        long_address: activity.longAddress,
        location: activity.location,

        ...(activity?.websiteUri && {website_uri: activity.websiteUri}),
        ...(activity?.reviewsUri && {reviews_uri: activity.reviewsUri}),
        ...(activity?.directionsUri && {directions_uri: activity.directionsUri}),
        ...(activity?.photosUri && {photos_uri: activity.photosUri}),
        ...(activity?.phoneNumber && {phone_number: activity.phoneNumber}),
        ...(activity?.rating && {rating: activity.rating}),
        ...(activity?.ratingsCount && {ratings_count: activity.ratingsCount}),
        ...(activity?.accessibilityOptions && {accessibility_options: activity.accessibilityOptions}),
        ...(activity?.openHours && {open_hours: activity.openHours}),
        ...(activity?.priceLevel && {price_level: activity.priceLevel}),
        ...(activity?.priceRange && {
            price_range: {
                start_price: activity.priceRange.startPrice,  
                ...(activity.priceRange?.endPrice && { end_price: activity.priceRange.endPrice }),
            }})
        };
    return activityDocData;
}

export function convertPlacesToActivities(places: any) {
    let activities: Activity[] = [];
        const priceLevelMappings = new Map([
            ['PRICE_LEVEL_FREE', 1],
            ['PRICE_LEVEL_INEXPENSIVE', 2],
            ['PRICE_LEVEL_MODERATE', 3],
            ['PRICE_LEVEL_EXPENSIVE', 4],
            ['PRICE_LEVEL_VERY_EXPENSIVE', 5],
        ]);
        console.log('Converting places to activities...');
        for (const place of places.data.places) {

            let openHours: OperatingHours[] = [];
            for (const opening of place?.regularOpeningHours?.periods ?? []) {

                if (opening.open.day === 0 && opening.open.hour === 0 && opening.open.minute === 0) {
                    break;
                }
                const openingFormattedTime = getFormattedTime(opening.open.day, opening.open.hour, opening.open.minute);
                const closingFormattedTime = getFormattedTime(opening.close.day, opening.close.hour, opening.close.minute);
                const normalizedStartTime = getNormalizedTime(opening.open.day, opening.open.hour, opening.open.minute);
                const normalizedEndTime = getNormalizedTime(opening.close.day, opening.close.hour, opening.close.minute);
                openHours.push({
                    opening: {
                        day: openingFormattedTime.day,
                        time: openingFormattedTime.time,
                        normalized_time: normalizedStartTime,
                    },
                    closing: {
                        day: closingFormattedTime.day,
                        time: closingFormattedTime.time,
                        normalized_time: normalizedEndTime,
                    }
                })
            }

            const priceLevel = priceLevelMappings.get(place.priceLevel);

            let priceRange: undefined | PriceRange = undefined;
            if (place?.priceRange) {
                priceRange = {
                    startPrice: Number(place.priceRange.startPrice.units),
                    ...(place.priceRange?.endPrice && { endPrice: Number(place.priceRange.endPrice.units)})
                };
            }
            
            const photoUrl = place?.photos?.[0]?.name
                ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?maxWidthPx=800&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
                : undefined;

            const activity: Activity = {

                activityID: place.id,
                activityName: place.displayName.text,
                types: place.types,
                address: place.shortFormattedAddress,
                longAddress: place.formattedAddress,
                location: place.location,

                ...(place?.websiteUri && {websiteUri: place.websiteUri}),
                ...(place?.googleMapsLinks?.reviewsUri && {reviewsUri: place.googleMapsLinks.reviewsUri}),
                ...(place?.googleMapsLinks?.directionsUri && {directionsUri: place.googleMapsLinks.directionsUri}),
                ...(photoUrl && {photosUri: photoUrl}),
                ...(place?.nationalPhoneNumber && {phoneNumber: place.nationalPhoneNumber}),
                ...(place?.rating && {rating: place.rating}),
                ...(place?.userRatingCount && {ratingsCount: place.userRatingCount}),
                ...(place?.accessibilityOptions && {accessibilityOptions: place?.accessibilityOptions}),
                ...(openHours.length && {openHours: openHours}),
                ...(priceLevel && {priceLevel: priceLevel}),
                ...(priceRange && {priceRange: priceRange}),
            };
            activities.push(activity);
        }
    return activities;
}
