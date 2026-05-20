"use client";

import { Box, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Activity, Location } from "@/../global_types";
import axios from "axios";
import { ActivityCard } from "./activity-card";

declare global {
  interface Window { initMap?: () => void; google: any; }
}

export default function ActivityPage({ activities, userLocation }: { activities: Activity[]; userLocation: Location }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const currentInfoWindow = useRef<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);

  useEffect(() => {
    axios.get("https://api.openweathermap.org/data/3.0/onecall", {
      params: {
        lat: userLocation.latitude, lon: userLocation.longitude,
        exclude: "minutely,hourly,alerts", units: "imperial",
        appid: "6d5a9182359310a9bcedb2e00d84050b",
      },
    })
      .then(r => setForecastData(r.data.daily.slice(0, 7)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (document.querySelector('[src*="maps.googleapis.com"]')) {

      if (window.google?.maps) {
        initMap();
      } else {
        const interval = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(interval);
            initMap();
          }
        }, 100);
      }
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    script.onload = initMap;
  }, []);

  function initMap() {
    if (!mapRef.current) return;
    mapInstance.current = new window.google.maps.Map(mapRef.current, {
      center: { lat: userLocation.latitude, lng: userLocation.longitude },
      zoom: 15,
      styles: mapStyles,
    });
    markers.current = activities.map(act => {
      const m = new window.google.maps.Marker({
        position: { lat: act.location.latitude, lng: act.location.longitude },
        map: mapInstance.current,
        title: act.activityName,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#ea580c",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });
      const iw = new window.google.maps.InfoWindow({
        content: `<div style="font-family:sans-serif;padding:4px 2px"><strong style="font-size:13px">${act.activityName}</strong><br/><span style="font-size:11px;color:#6b7280">${act.address.split(",")[0]}</span></div>`,
      });
      m.addListener("click", () => {
        currentInfoWindow.current?.close();
        iw.open(mapInstance.current, m);
        currentInfoWindow.current = iw;
      });
      return m;
    });
  }

  const centerMapOnActivity = (act: Activity) => {
    if (!mapInstance.current) return;
    const target = { lat: act.location.latitude, lng: act.location.longitude };
    mapInstance.current.panTo(target);
    mapInstance.current.setZoom(17);
    const idx = activities.findIndex(a => a.activityID === act.activityID);
    if (idx !== -1) window.google.maps.event.trigger(markers.current[idx], "click");
  };

  const weatherEmoji = (main: string) => {
    if (main.includes("Clear")) return "☀️";
    if (main.includes("Cloud")) return "☁️";
    if (main.includes("Rain")) return "🌧️";
    if (main.includes("Snow")) return "❄️";
    if (main.includes("Thunder")) return "⛈️";
    return "🌡️";
  };

  return (
    <Box minH="95vh" px={4} py={5} bg="gray.50" color="gray.800">

      {}
      <Box
        mb={4} p={4} borderRadius="xl"
        bg="white" border="0.5px solid" borderColor="gray.200"
        boxShadow="sm"
      >
        <Text fontSize="xs" fontWeight="600" color="gray.400" letterSpacing="wider" textTransform="uppercase" mb={3}>
          7-Day Forecast
        </Text>
        <Box display="flex" overflowX="auto" gap={2} pb={1} sx={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
          {forecastData.length ? forecastData.map((d, i) => {
            const date = new Date(d.dt * 1000);
            const isToday = date.toDateString() === new Date().toDateString();
            return (
              <Box
                key={i} flexShrink={0} minW="80px" px={3} py={2}
                borderRadius="lg" textAlign="center"
                bg={isToday ? "orange.500" : "gray.50"}
                border="0.5px solid" borderColor={isToday ? "orange.500" : "gray.200"}
              >
                <Text fontSize="10px" color={isToday ? "orange.100" : "gray.400"} mb={1}>
                  {isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" })}
                </Text>
                <Text fontSize="18px">{weatherEmoji(d.weather[0].main)}</Text>
                <Text fontSize="12px" fontWeight="600" color={isToday ? "white" : "gray.700"} mt={1}>
                  {Math.round(d.temp.day)}°F
                </Text>
              </Box>
            );
          }) : (
            <Text fontSize="sm" color="gray.400">Loading weather…</Text>
          )}
        </Box>
      </Box>

      {}
      <Flex direction={{ base: "column", md: "row" }} gap={4} height={{ md: "72vh" }}>

        {}
        <Box
          w={{ base: "100%", md: "380px" }}
          flexShrink={0}
          overflowY="auto"
          pr={1}
          sx={{ scrollbarWidth: "thin", "&::-webkit-scrollbar": { width: "4px" }, "&::-webkit-scrollbar-thumb": { background: "#d1d5db", borderRadius: "4px" } }}
        >
          <Text fontSize="xs" fontWeight="600" color="gray.400" letterSpacing="wider" textTransform="uppercase" mb={3}>
            {activities.length} Restaurants Near You
          </Text>
          <VStack gap={3} align="stretch">
            {activities.map(act => (
              <ActivityCard
                key={act.activityID}
                activity={act}
                userLocation={userLocation}
                onClick={() => centerMapOnActivity(act)}
              />
            ))}
          </VStack>
        </Box>

        {}
        <Box
          ref={mapRef}
          flex={1}
          borderRadius="xl"
          overflow="hidden"
          border="0.5px solid"
          borderColor="gray.200"
          boxShadow="sm"
          minH={{ base: "300px", md: "auto" }}
        />
      </Flex>
    </Box>
  );
}

const mapStyles = [
  { featureType: "all", elementType: "geometry", stylers: [{ saturation: -30 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#d0e8f0" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9c9c9" }] },
];
