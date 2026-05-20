export function convertMilitaryToStandardTime(militaryTime: string) {
    const timeComponents = militaryTime.split(':');
    let standardHour: string;
    if ( timeComponents[0] >= '01' && timeComponents[0] <= '12')
    {
        standardHour = timeComponents[0];
    }
    else {
        let convertedHour = Number(timeComponents[0]) % 12;
        convertedHour = (convertedHour === 0 ? 12 : convertedHour);
        standardHour = (convertedHour < 10 ? '0' + convertedHour : convertedHour.toString()); 
    }
    const timeSuffix = (timeComponents[0] <= '11' ? 'AM' : 'PM');

    return `${standardHour}:${timeComponents[1]} ${timeSuffix}`;
}