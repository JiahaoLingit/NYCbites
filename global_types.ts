//Project Defined Types

export type ActivitySlot = {
    start: {
        day: string,
        time: string,
        normalized_time?: number,
    },
    end: {
        day: string,
        time: string, 
        normalized_time?: number,
    },
    activity_types: string[],
};

export type AvailabilitySlot = {
    start: {
        day: string,
        time: string, 
    },
    end: {
        day: string,
        time: string, 
    },
};

export type Location = {
    latitude: number,
    longitude: number,
}

export type Activity = {
    activityID: string
    activityName: string,
    types: string[],
    address: string,
    longAddress: string,
    location: Location,
    websiteUri?: string,
    reviewsUri?: string,
    directionsUri?: string,
    photosUri?: string,
    phoneNumber?: string,
    rating?: number,
    ratingsCount?: number
    openHours?: OperatingHours[],
    currentOpening?: OperatingHours,
    nextOpening?: OperatingHours,
    accessibilityOptions?: string[],
    priceLevel?: number,
    priceRange?: {
        startPrice: number,
        endPrice?: number,
    },
}

export type OperatingHours = {
    opening: {
        day: string,
        time: string,
        normalized_time?: number,
    },
    closing: {
        day: string,
        time: string,
        normalized_time?: number,
    }
}  

export type PriceRange = {
    startPrice: number,
    endPrice?: number,
}