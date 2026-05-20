"use client";

import {
  Select,
  createListCollection,
  Portal,
  Box,
  Heading,
  Grid,
  GridItem,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { RefObject } from "react";

const foodOptions = createListCollection({
  items: [
    { label: "Acai Shop", value: "acai_shop" },
    { label: "Afghani Cuisine", value: "afghani_restaurant" },
    { label: "African Cuisine", value: "african_restaurant" },
    { label: "American Cuisine", value: "american_restaurant" },
    { label: "Asian Cuisine", value: "asian_restaurant" },
    { label: "Bagel Shop", value: "bagel_shop" },
    { label: "Bakery", value: "bakery" },
    { label: "Bar", value: "bar" },
    { label: "Bar and Grill", value: "bar_and_grill" },
    { label: "Barbecue Cuisine", value: "barbecue_restaurant" },
    { label: "Brazilian Cuisine", value: "brazilian_restaurant" },
    { label: "Breakfast Restaurant", value: "breakfast_restaurant" },
    { label: "Brunch Restaurant", value: "brunch_restaurant" },
    { label: "Buffet Restaurant", value: "buffet_restaurant" },
    { label: "Cafe", value: "cafe" },
    { label: "Cafeteria", value: "cafeteria" },
    { label: "Candy Store", value: "candy_store" },
    { label: "Cat Cafe", value: "cat_cafe" },
    { label: "Chinese Cuisine", value: "chinese_restaurant" },
    { label: "Chocolate Factory", value: "chocolate_factory" },
    { label: "Chocolate Shop", value: "chocolate_shop" },
    { label: "Coffee Shop", value: "coffee_shop" },
    { label: "Confectionery", value: "confectionery" },
    { label: "Deli", value: "deli" },
    { label: "Dessert Restaurant", value: "dessert_restaurant" },
    { label: "Dessert Shop", value: "dessert_shop" },
    { label: "Diner", value: "diner" },
    { label: "Donut Shop", value: "donut_shop" },
    { label: "Fast Food", value: "fast_food_restaurant" },
    { label: "Fine Dining", value: "fine_dining_restaurant" },
    { label: "Food Court", value: "food_court" },
    { label: "French Cuisine", value: "french_restaurant" },
    { label: "Greek Cuisine", value: "greek_restaurant" },
    { label: "Hamburger Restaurant", value: "hamburger_restaurant" },
    { label: "Ice Cream Shop", value: "ice_cream_shop" },
    { label: "Indian Cuisine", value: "indian_restaurant" },
    { label: "Indonesian Cuisine", value: "indonesian_restaurant" },
    { label: "Italian Cuisine", value: "italian_restaurant" },
    { label: "Japanese Cuisine", value: "japanese_restaurant" },
    { label: "Juice Shop", value: "juice_shop" },
    { label: "Korean Cuisine", value: "korean_restaurant" },
    { label: "Lebanese Cuisine", value: "lebanese_restaurant" },
    { label: "Meal Delivery", value: "meal_delivery" },
    { label: "Meal Takeaway", value: "meal_takeaway" },
    { label: "Mediterranean Cuisine", value: "mediterranean_restaurant" },
    { label: "Mexican Cuisine", value: "mexican_restaurant" },
    { label: "Middle Eastern Cuisine", value: "middle_eastern_restaurant" },
    { label: "Pizza Restaurant", value: "pizza_restaurant" },
    { label: "Pub", value: "pub" },
    { label: "Ramen Restaurant", value: "ramen_restaurant" },
    { label: "Sandwich Shop", value: "sandwich_shop" },
    { label: "Seafood Cuisine", value: "seafood_restaurant" },
    { label: "Spanish Cuisine", value: "spanish_restaurant" },
    { label: "Steak House", value: "steak_house" },
    { label: "Sushi Restaurant", value: "sushi_restaurant" },
    { label: "Tea House", value: "tea_house" },
    { label: "Thai Cuisine", value: "thai_restaurant" },
    { label: "Turkish Cuisine", value: "turkish_restaurant" },
    { label: "Vegan Restaurant", value: "vegan_restaurant" },
    { label: "Vegetarian Restaurant", value: "vegetarian_restaurant" },
    { label: "Vietnamese Cuisine", value: "vietnamese_restaurant" },
    { label: "Wine Bar", value: "wine_bar" },
  ],
});

const cultureOptions = createListCollection({
  items: [
    { label: "Art Gallery", value: "art_gallery" },
    { label: "Art Studio", value: "art_studio" },
    { label: "Auditorium", value: "auditorium" },
    { label: "Cultural Landmark", value: "cultural_landmark" },
    { label: "Historical Place", value: "historical_place" },
    { label: "Monument", value: "monument" },
    { label: "Museum", value: "museum" },
    { label: "Performing Arts Theater", value: "performing_arts_theater" },
    { label: "Library", value: "library" },
    { label: "Cultural Center", value: "cultural_center" },
    { label: "Dance Hall", value: "dance_hall" },
    { label: "Opera House", value: "opera_house" },
    { label: "Philharmonic Hall", value: "philharmonic_hall" },
  ],
});

const outdoorsOptions = createListCollection({
  items: [
    { label: "Adventure Sports", value: "adventure_sports_center" },
    { label: "Amusement Park", value: "amusement_park" },
    { label: "Barbecue Area", value: "barbecue_area" },
    { label: "Botanical Garden", value: "botanical_garden" },
    { label: "Cycling Park", value: "cycling_park" },
    { label: "Dog Park", value: "dog_park" },
    { label: "Ferris Wheel", value: "ferris_wheel" },
    { label: "Garden", value: "garden" },
    { label: "Hiking Area", value: "hiking_area" },
    { label: "Historical Landmark", value: "historical_landmark" },
    { label: "Marina", value: "marina" },
    { label: "National Park", value: "national_park" },
    { label: "Observation Deck", value: "observation_deck" },
    { label: "Off-roading Area", value: "off_roading_area" },
    { label: "Park", value: "park" },
    { label: "Picnic Ground", value: "picnic_ground" },
    { label: "Playground", value: "playground" },
    { label: "Roller Coaster", value: "roller_coaster" },
    { label: "Skateboard Park", value: "skateboard_park" },
    { label: "State Park", value: "state_park" },
    { label: "Tourist Attraction", value: "tourist_attraction" },
    { label: "Water Park", value: "water_park" },
    { label: "Wedding Venue", value: "wedding_venue" },
    { label: "Wildlife Park", value: "wildlife_park" },
    { label: "Wildlife Refuge", value: "wildlife_refuge" },
    { label: "Zoo", value: "zoo" },
    { label: "Fishing Charter", value: "fishing_charter" },
    { label: "Fishing Pond", value: "fishing_pond" },
    { label: "Golf Course", value: "golf_course" },
    { label: "Ski Resort", value: "ski_resort" },
  ],
});


const indoorsOptions = createListCollection({
  items: [
    { label: "Amphitheatre", value: "amphitheatre" },
    { label: "Amusement Center", value: "amusement_center" },
    { label: "Aquarium", value: "aquarium" },
    { label: "Banquet Hall", value: "banquet_hall" },
    { label: "Bowling Alley", value: "bowling_alley" },
    { label: "Casino", value: "casino" },
    { label: "Children's Camp", value: "childrens_camp" },
    { label: "Comedy Club", value: "comedy_club" },
    { label: "Community Center", value: "community_center" },
    { label: "Concert Hall", value: "concert_hall" },
    { label: "Convention Center", value: "convention_center" },
    { label: "Event Venue", value: "event_venue" },
    { label: "Internet Cafe", value: "internet_cafe" },
    { label: "Karaoke", value: "karaoke" },
    { label: "Movie Rental", value: "movie_rental" },
    { label: "Movie Theater", value: "movie_theater" },
    { label: "Night Club", value: "night_club" },
    { label: "Planetarium", value: "planetarium" },
    { label: "Plaza", value: "plaza" },
    { label: "Video Arcade", value: "video_arcade" },
    { label: "Visitor Center", value: "visitor_center" },
    { label: "Arena", value: "arena" },
    { label: "Athletic Field", value: "athletic_field" },
    { label: "Fitness Center", value: "fitness_center" },
    { label: "Gym", value: "gym" },
    { label: "Ice Skating Rink", value: "ice_skating_rink" },
    { label: "Sports Activity Location", value: "sports_activity_location" },
    { label: "Sports Club", value: "sports_club" },
    { label: "Sports Coaching", value: "sports_coaching" },
    { label: "Sports Complex", value: "sports_complex" },
    { label: "Stadium", value: "stadium" },
    { label: "Swimming Pool", value: "swimming_pool" },
  ],
});

export default function ActivitiesStep({currentlySelected}: { currentlySelected: RefObject<string[]>}) {
  useEffect(() => {
    localStorage.removeItem("userPreferences");
  }, []);

  const preferenceList = [
    { label: "Food", options: foodOptions },
    { label: "Culture & Education", options: cultureOptions },
    { label: "Recreation (Outdoors)", options: outdoorsOptions },
    { label: "Recreation (Indoors)", options: indoorsOptions },
  ];

  const [selectedPrefs, setSelectedPrefs] = useState<string[][]>([[], [], [], []]);

  const handleSelect = (idx: number, value: string[]) => {
    const upd = [...selectedPrefs];
    upd[idx] = value;
    currentlySelected.current = upd.flat();
    setSelectedPrefs(upd);
  };

  const handleSubmit = () => {
    const [food, museum, outdoor, shopping] = selectedPrefs;
    const prefs = { food, museum, outdoor, shopping };
    localStorage.setItem("userPreferences", JSON.stringify(prefs));

    const redirect =
      localStorage.getItem("postPreferenceRedirect") || "/select";
    localStorage.removeItem("postPreferenceRedirect");

  };

  const handleSkip = () => {
    localStorage.removeItem("userPreferences");
    const redirect =
      localStorage.getItem("postPreferenceRedirect") || "/select";
    localStorage.removeItem("postPreferenceRedirect");
  };

  const handleClear = () => setSelectedPrefs([[], [], [], []]);

  return (
    <Box
      maxW="800px"
      mx="auto"
      mt={10}
      p={6}
      border="1px solid #ddd"
      borderRadius="xl"
      boxShadow="md"
    >
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        Choose Your Preferences
      </Heading>

      <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
        {preferenceList.map((pref, idx) => (
          <GridItem key={idx}>
            <Select.Root
              collection={pref.options}
              multiple={true}
              onValueChange={(val) => {handleSelect(idx, val.value)}}
              size="sm"
              width="100%"
            >
              <Select.HiddenSelect />
              <Select.Label>{pref.label}</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder={`Select ${pref.label}`} />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {pref.options.items.map((item) => (
                      <Select.Item key={item.value} item={item}>
                        {item.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </GridItem>
        ))}
      </Grid>

      {/*
      <VStack padding={3} align="stretch">
        <Button colorScheme="blue" size="lg" width="100%" onClick={handleSubmit}>
          Select Your Preferences
        </Button>
        <HStack padding={4} width="100%">
          <Button flex={1} variant="outline" size="lg" onClick={handleClear}>
            Clear All
          </Button>
          <Button flex={1} variant="outline" size="lg" onClick={handleSkip}>
            Skip
          </Button>
        </HStack>
      </VStack>
      */}
    </Box>
  );
}