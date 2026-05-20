"use client";

import { Box, Button, Text } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Location, Activity } from "../../../global_types";
import { firebaseAuth } from "../firebase";
import ActivityPage from "./_components/activity-page";

export default function SelectActivities() {
    const router   = useRouter();
    const activities = useRef<Activity[]>([]);

    const [loading,             setLoading]             = useState(true);
    const [activitiesRetrieved, setActivitiesRetrieved] = useState(false);
    const [locationDisplay,     setLocationDisplay]     = useState("");

    useEffect(() => {
        fetchActivities();
    }, []);

    async function fetchActivities() {
        setLoading(true);
        try {
            const prefsRaw = localStorage.getItem("userPreferences");
            const prefs    = prefsRaw ? JSON.parse(prefsRaw) : {};

            let userLocation: Location;
            if (prefs.location?.latitude && prefs.location?.longitude) {
                userLocation = { latitude: prefs.location.latitude, longitude: prefs.location.longitude };
                setLocationDisplay(prefs.address ?? "");
            } else {

                try {
                    const geoRes = await axios.get("https://api.geoapify.com/v1/ipinfo", {
                        params: { apiKey: process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY },
                    });
                    userLocation = {
                        latitude:  geoRes.data.location.latitude,
                        longitude: geoRes.data.location.longitude,
                    };
                } catch {
                    userLocation = { latitude: 40.7128, longitude: -74.0060 };
                }
            }

            const types: string[] = prefs.activityTypes?.length
                ? prefs.activityTypes
                : ["restaurant"];

            const distance = prefs.distance && prefs.distance !== "any"
                ? prefs.distance
                : "1";

            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/select_activities/api/retrieve-activities`, {
                data: {
                    user_location:  userLocation,
                    user_id:        firebaseAuth.currentUser?.uid,
                    activity_types: types,
                    budget:         prefs.budget ?? null,
                    distance,
                },
            });

            let fetched: Activity[] = res?.data.activities ?? [];

            const selectedCuisines: string[] = prefs.cuisines ?? [];
            const selectedStyles: string[]   = prefs.diningStyles ?? [];

            if (selectedCuisines.length > 0) {
                fetched = fetched.filter(a =>
                    selectedCuisines.some(c => a.types.includes(c))
                );
            }

            if (selectedStyles.length > 0 && selectedCuisines.length === 0) {
                fetched = fetched.filter(a =>
                    selectedStyles.some(s => a.types.includes(s))
                );
            }

            if (prefs.budget) {
                const budgetNum = parseInt(prefs.budget);
                fetched = fetched.filter(a =>
                    a.priceLevel === undefined || a.priceLevel === budgetNum
                );
            }

            if (prefs.minRating && parseFloat(prefs.minRating) > 0) {
                const minR = parseFloat(prefs.minRating);
                fetched = fetched.filter(a =>
                    a.rating === undefined || a.rating >= minR
                );
            }

            if (prefs.minRatingCount && parseInt(prefs.minRatingCount) > 0) {
                const minC = parseInt(prefs.minRatingCount);
                fetched = fetched.filter(a =>
                    a.ratingsCount === undefined || a.ratingsCount >= minC
                );
            }

            if (prefs.hours && prefs.hours !== "any") {
                const now = new Date();
                const currentDay  = now.getDay();
                const currentHour = now.getHours();

                if (prefs.hours === "open_now") {
                    fetched = fetched.filter(a => !!a.currentOpening);
                } else if (prefs.hours === "open_tonight") {
                    fetched = fetched.filter(a => {
                        if (!a.openHours) return true;
                        return a.openHours.some((h: any) => {
                            const closingDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(h.closing.day);
                            return closingDay === currentDay && parseInt(h.closing.time) >= 2000;
                        });
                    });
                } else if (prefs.hours === "open_weekends") {
                    fetched = fetched.filter(a => {
                        if (!a.openHours) return true;
                        return a.openHours.some((h: any) => {
                            const openingDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].indexOf(h.opening.day);
                            return openingDay === 0 || openingDay === 6;
                        });
                    });
                }
            }

            if (prefs.budget) {
                const budgetNum = parseInt(prefs.budget);
                fetched = fetched.filter(a =>
                    a.priceLevel === undefined || a.priceLevel === budgetNum
                );
            }

            activities.current = fetched;
            setLoading(false);
            setActivitiesRetrieved(true);
        } catch (err) {
            console.error("fetchActivities error:", err);
            activities.current = [];
            setLoading(false);
            setActivitiesRetrieved(true);
        }
    }

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh", background: "#0c0700",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "16px",
                paddingTop: "56px",
            }}>
                <div style={{ fontSize: "48px", animation: "spin 2s linear infinite" }}>🍽️</div>
                <p style={{ color: "rgba(255,248,240,0.5)", fontFamily: "system-ui", fontSize: "15px" }}>
                    Finding restaurants near you...
                </p>
                {locationDisplay && (
                    <p style={{ color: "#fb923c", fontFamily: "system-ui", fontSize: "13px" }}>
                        📍 {locationDisplay}
                    </p>
                )}
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (activitiesRetrieved && activities.current.length === 0) {
        return (
            <div style={{
                minHeight: "100vh", background: "#0c0700",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "16px",
                paddingTop: "56px",
            }}>
                <div style={{ fontSize: "48px" }}>😔</div>
                <p style={{ color: "rgba(255,248,240,0.6)", fontFamily: "system-ui", fontSize: "16px" }}>
                    No restaurants found for your preferences
                </p>
                <button
                    onClick={() => router.push("/prefer")}
                    style={{
                        padding: "12px 28px",
                        background: "linear-gradient(135deg, #c2410c, #ea580c)",
                        color: "white", border: "none", borderRadius: "999px",
                        fontSize: "14px", fontWeight: 700, cursor: "pointer",
                        fontFamily: "system-ui",
                    }}>
                    Change Preferences
                </button>
            </div>
        );
    }

    return (
        <>
            {}
            <div style={{
                position: "fixed", top: "56px", left: 0, right: 0, zIndex: 50,
                background: "rgba(12,7,0,0.9)", backdropFilter: "blur(8px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
                <div style={{ fontSize: "13px", color: "rgba(255,248,240,0.45)", fontFamily: "system-ui" }}>
                    {activities.current.length} restaurants
                    {locationDisplay && <span> near <span style={{ color: "#fb923c" }}>{locationDisplay}</span></span>}
                </div>
                <button
                    onClick={() => router.push("/prefer")}
                    style={{
                        padding: "6px 16px",
                        background: "rgba(251,146,60,0.1)",
                        color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)",
                        borderRadius: "999px", fontSize: "12px",
                        cursor: "pointer", fontFamily: "system-ui",
                    }}>
                    ✦ Change Preferences
                </button>
            </div>

            <div style={{ paddingTop: "96px" }}>
                {activitiesRetrieved && (
                    <ActivityPage
                        activities={activities.current}
                        userLocation={{ latitude: 40.7128, longitude: -74.0060 }}
                    />
                )}
            </div>
        </>
    );
}
