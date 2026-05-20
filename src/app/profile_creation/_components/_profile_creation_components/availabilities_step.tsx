'use client';

type SingleSlot = {
  day: number,
  //in military time
  hour: number,
}

import { RefObject, useState, Fragment, useEffect } from "react";
import { AvailabilitySlot } from "@/../global_types";
import {
  Grid,
  Box,
  Switch,
  HStack,
  Text,
  Button,
  NumberInput,
  Heading
} from "@chakra-ui/react";

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const baseHours = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

function convertToMilitaryHour(strHour: string, period: 'AM' | 'PM') {
  const hour = Number(strHour);
  if (period === 'AM') {
    return hour === 12 ? 0 : hour;
  } else {
    return hour === 12 ? 12 : hour + 12;
  }
};

// Function to format time in military (24-hour) format
function formatMilitaryTime(hour: number) {
  const formattedHour = hour % 24;
  return String(formattedHour).padStart(2, '0') + ':00'; // Always in 24-hour format, no AM/PM
};

export function mergeConsecutiveSlots(slots: SingleSlot[]) {
  // Sort the slots first by day and then by military hour
  slots.sort((a, b) => a.day !== b.day ? a.day - b.day : a.hour - b.hour);
  const activitySlots: AvailabilitySlot[] = [];
  
  let currentActivitySlot: AvailabilitySlot = undefined!;

  for (const slot of slots) {
    if (!currentActivitySlot) {
      currentActivitySlot = {
        start: {
          day: days[slot.day], 
          time: formatMilitaryTime(slot.hour)
        }, 
        end: {
          day: slot.hour === 23 ? days[(slot.day + 1) % 7] : days[slot.day], 
          time: formatMilitaryTime((slot.hour + 1) % 24),
        }
      };
      continue;
    }

    const slotDay = days[slot.day];
    const slotTime = formatMilitaryTime(slot.hour);
    const isConsecutive = (currentActivitySlot.end.day === slotDay && currentActivitySlot.end.time === slotTime);

    if (isConsecutive) {
      currentActivitySlot.end.time !== '23:00' ? 
      currentActivitySlot.end.time = formatMilitaryTime(slot.hour + 1) : 
      currentActivitySlot.end = { day: days[(slot.day + 1) % 7], time: '00:00' };
    } 
    else {
      activitySlots.push(currentActivitySlot);
      currentActivitySlot = {
        start: {
          day: days[slot.day], 
          time: formatMilitaryTime(slot.hour)
        }, 
        end: {
          day: slot.hour === 23 ? days[(slot.day + 1) % 7] : days[slot.day], 
          time: formatMilitaryTime((slot.hour + 1) % 24),
        }
      };
    }
  }

  if (currentActivitySlot) {
    activitySlots.push(currentActivitySlot);
  }

  //ActivitySlot starting from 'Sunday, 00:00'
  const sundayStartSlot = activitySlots[0].start.day === "Sunday" && activitySlots[0].start.time === "00:00" ?
                          activitySlots[0] : 
                          undefined;
  //ActivitySlot end at 'Sunday, 00:00'
  const sundayEndSlot = activitySlots[activitySlots.length - 1].end.day === "Sunday" && activitySlots[activitySlots.length - 1].end.time === "00:00" ?
                        activitySlots[activitySlots.length - 1] : 
                        undefined;

  if (sundayStartSlot && sundayEndSlot) {
    const wrapAroundActivitySlot = {
      start: {
        day: sundayEndSlot.start.day, 
        time: sundayEndSlot.start.time,
      },
      end: {
        day: sundayStartSlot.end.day,
        time: sundayStartSlot.end.time,
      }
    }
    activitySlots.shift();
    activitySlots.pop();
    activitySlots.push(wrapAroundActivitySlot);
  }

  return activitySlots;
};

export function AvailabilitiesStep({ currentlySelectedSlots, currentlySelectedDistance }: { currentlySelectedSlots: RefObject<SingleSlot[]>, currentlySelectedDistance: RefObject<number> }) {
  const [view, setView] = useState<'AM' | 'PM'>('PM');
  const [selectedAMSlots, setSelectedAMSlots] = useState<Set<string>>(new Set());
  const [selectedPMSlots, setSelectedPMSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const selectedSlots = [
      ...Array.from(selectedAMSlots),
      ...Array.from(selectedPMSlots),
    ].map((slot) => {
      const [day, hourWithMeridian] = slot.split('-');
      // Extract hour from '1PM' -> '1'
      const hour = Number(hourWithMeridian.slice(0, -2)); 
      const period = hourWithMeridian.slice(-2) as 'AM' | 'PM';
      const militaryHour = convertToMilitaryHour(hour.toString(), period);
      return {
        day: days.indexOf(day),
        hour: militaryHour,
      };
    });
    currentlySelectedSlots.current = selectedSlots;
  }, [selectedAMSlots, selectedPMSlots]);

  const toggleSlot = (day: string, hour: string) => {
    const key = `${day}-${hour}${view}`;
    const setFunc = view === 'AM' ? setSelectedAMSlots : setSelectedPMSlots;

    setFunc((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const currentSelectedSlots = view === 'AM' ? selectedAMSlots : selectedPMSlots;

  return (
    <>
    <Heading>Select Your Availabilities</Heading>
    <Box w="full" maxW="4xl" bg="gray.50" p={4} borderRadius="lg">
      <HStack justify="space-between" mb={4}>
        <HStack>
          <Text>AM</Text>
          <Switch.Root
            checked={view === 'PM'}
            onCheckedChange={() => setView(view === 'AM' ? 'PM' : 'AM')}
          >
            <Switch.HiddenInput />
            <Switch.Control />
          </Switch.Root>
          <Text>PM</Text>
        </HStack>
      </HStack>

      <Grid
        templateColumns={`repeat(${days.length + 1}, 1fr)`}
        gap={2}
        bg="gray.200"
        p={4}
        borderRadius="lg"
      >
        <Box /> {/* Empty top-left corner */}
        {days.map((day) => (
          <Box
            key={day}
            textAlign="center"
            fontWeight="bold"
            bg="gray.300"
            p={2}
            borderRadius="md"
          >
            {day}
          </Box>
        ))}

        {baseHours.map((hour) => (
          <Fragment key={hour}>
            <Box textAlign="right" pr={2} fontWeight="bold" fontSize="lg">
              {hour + ' ' + view}
            </Box>
            {days.map((day) => {
              const key = `${day}-${hour}${view}`;
              const isSelected = currentSelectedSlots.has(key);
              return (
                <Box
                  key={key}
                  h="3rem"
                  w="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="md"
                  cursor="pointer"
                  transition="all 0.2s"
                  bg={isSelected ? 'yellow.50' : 'gray.400'}
                  onClick={() => toggleSlot(day, hour)}
                />
              );
            })}
          </Fragment>
        ))}
      </Grid>
    </Box>
    <Heading marginTop={'1em'}>How Far Are You Willing To Travel?</Heading>
    <NumberInput.Root 
      defaultValue="1"
      width="200px" 
      min={0.5} 
      max={15} 
      step={0.5} 
      allowMouseWheel 
      formatOptions={{
          style: "unit",
          unit: "mile",
          unitDisplay: "long",
      }}
      onValueChange={(val) => {currentlySelectedDistance.current = val.valueAsNumber}}>
      <NumberInput.Control/>
      <NumberInput.Input />
    </NumberInput.Root>
    </>
  );
}