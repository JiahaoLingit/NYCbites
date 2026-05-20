import { RefObject, useEffect, useState } from "react";
import { ActivitySlot, AvailabilitySlot } from "@/../global_types";
import { Grid, Heading, Separator, Text, VStack, HStack, Flex, Tag, Button } from "@chakra-ui/react";
import { DndContext, useDraggable, useDndMonitor, useDroppable} from '@dnd-kit/core';
import { convertMilitaryToStandardTime } from "@/app/utils/activityUtils";

/*
type MockData = {
    availabilitySlots: AvailabilitySlot[],
    availabilityTypes: string[],
}
*/

export default function AssignmentsStep({currentlySelected, selectedAvailabilities, selectedActivities}: { 
    currentlySelected: RefObject<ActivitySlot[]>,
    selectedAvailabilities: RefObject<AvailabilitySlot[]>,
    selectedActivities: RefObject<string[]>
}) {
    //const mockData = getMockData();

    if (currentlySelected.current.length === 0) {
        currentlySelected.current = selectedAvailabilities.current.map(slot => ({
            ...slot,
            activity_types: []
        }));
    }

    //useEffect for Mock
    /*
    useEffect(() => {
        let activitySlots: ActivitySlot[] = [];
        for (const availabilitySlot of mockData.availabilitySlots)
        {
            activitySlots.push({...availabilitySlot, activity_types: []});
        }
        currentlySelected.current = activitySlots;
    }, []);
    */

    // How components will actually be fetched
    const activityComponents = selectedActivities.current.map((activity, index) =>
        <AssignmentActivity key={index} activityType={activity} activityID={activity}/>
    );
    const activitySlotComponents = selectedAvailabilities.current.map((availability, index) => 
        <AssignmentActivitySlot key={index} availabilitySlot={availability} slotID={index+1} activitySlots={currentlySelected}/>
    );

    /*
    const activityComponents = mockData.availabilityTypes.map((activity, index) =>
        <AssignmentActivity key={index} activityType={activity} activityID={activity}/>
    );
    */
    /*
    const activitySlotComponents = mockData.availabilitySlots.map((availability, index) => 
        <AssignmentActivitySlot key={index} availabilitySlot={availability} slotID={index+1} activitySlots={currentlySelected}/>
    );
    */ 
    
    return (
        <DndContext>
            <VStack>
                <VStack>
                    <Heading>Activity Slots</Heading>
                    <HStack
                    >
                        {activitySlotComponents}
                    </HStack>
                </VStack>
                <VStack>
                    <Heading>Assign Your Activities</Heading>
                    <Grid 
                        templateColumns="repeat(auto-fill, minmax(100px, 1fr))"
                        autoFlow="row"           
                        gap="2"
                        maxW={'500px'}
                    >
                        {activityComponents}
                    </Grid>
                </VStack>
            </VStack>
        </DndContext>
    );
}

function AssignmentActivitySlot({availabilitySlot, slotID, activitySlots}: {availabilitySlot: AvailabilitySlot, slotID: number, activitySlots: RefObject<ActivitySlot[]>}) {
    const [activityTypes, setActivityTypes] = useState<string[]>([]);
    const {setNodeRef} = useDroppable({
        id: `slot${slotID}-droppable`,
    });

    useEffect(() => {
        if (activitySlots.current && activitySlots.current[slotID - 1]) {
            activitySlots.current[slotID - 1].activity_types = activityTypes;
            console.log(activitySlots.current)
        }
    }, [activityTypes])

    //Handling of activitySlots global state like this is very frail
    //In the future, each activity slot should be assigned an activity directly, as
    //opposed to just using the index
    //useDndMonitor handles drag events
    useDndMonitor({
        onDragEnd(event) {
            const {active, over} = event;
            const activity = String(active.id);
            if (over?.id === `slot${slotID}-droppable` &&
                !activity.startsWith('slot')) 
            {
                setActivityTypes((prevState) => {
                    if (!prevState.includes(activity)) {
                        return [...prevState, activity];
                    } 
                    else {
                        return prevState;
                    }
                });
            }
            else if (!(over?.id === `slot${slotID}-droppable`) &&
                     activity.startsWith(`slot${slotID}`)) {
                const [prefix, activityName] = activity.split('-');
                setActivityTypes((prevState) => prevState.filter((activityType) => {
                    return activityType !== activityName;
                }));
                activitySlots.current[slotID - 1].activity_types = activityTypes;
                console.log(activitySlots.current);
            }
        },
    })

    return (
        <VStack
            border={'solid'}
            borderTopRadius={'1em'}
            borderBottomRadius={'1em'}
            borderWidth="1px"
            borderColor="gray.300"
            boxShadow="md"
            bg="white"
            paddingTop={3}
            
        >
            <Heading>Slot #{slotID}</Heading>
            <Separator/>
            <VStack mb={3}>
                <Text fontWeight="semibold" fontSize="sm" mb={-3}>From:</Text>
                <Text fontSize="sm" color="gray.700">
                    {availabilitySlot.start.day}, {convertMilitaryToStandardTime(availabilitySlot.start.time)}
                </Text>

                <Text fontWeight="semibold" fontSize="sm" mb={-3}>To:</Text>
                <Text fontSize="sm" color="gray.700">
                    {availabilitySlot.end.day}, {convertMilitaryToStandardTime(availabilitySlot.end.time)}
                </Text>
            </VStack>

            <Flex
                ref={setNodeRef}
                wrap="wrap"
                gap="2"
                width={'12em'}
                minHeight="2em"
                border="dashed"
                borderWidth={'thick'}
                bgColor={'black/70'}
                borderBottomRadius={'0.8em'}
                >
                {activityTypes.map((activity, index) =>
                    <AssignmentActivity key={index} activityType={activity} activityID={'slot' + slotID + '-' + activity}/>
                )}
            </Flex>

        </VStack>
    );    
} 

//Represents activity draggable item
function AssignmentActivity({activityType, activityID}: {activityType: string, activityID: string}) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: activityID,
    });
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        cursor: 'grabbing',
    } : {
        cursor: 'grab',
    }

    return (
        <Tag.Root
            ref={setNodeRef} 
            style={style}
            {...listeners} 
            {...attributes}
            variant={'solid'}  
            size={'md'}      
            colorPalette={'teal'}    
        >
            <Tag.Label>
            {activityType.split('_').map((word) => 
                word = word[0].toUpperCase() + word.substring(1)
            ).join(' ')}
            </Tag.Label>
        </Tag.Root>
    );
}

/*
function getMockData() {
    const availabilityTypes = [
        'restaurant',
        'deli',
    ];
    const availabilitySlots: AvailabilitySlot[] = [
        {
            start: {
                day: 'Sunday',
                time: '09:30',
            },
            end: {
                day: 'Sunday',
                time: '13:15',
            }
        },
        {
            start: {
                day: 'Tuesday',
                time: '18:00',
            },
            end: {
                day: 'Sunday',
                time: '21:45',
            }
        },
    ];

    const mockData: MockData = {
        availabilitySlots: availabilitySlots,
        availabilityTypes: availabilityTypes,
    }

    return mockData;
}
*/