'use client'

export function getNormalizedTime(day: number, hours: number, minutes: number) {
    return day * 24 * 60 + hours * 60 + minutes;
}

export function getNormalizedTimeFromFormattedTime(dayName: string, time: string) {
    const dayNames = new Map([
        ['Sunday', 0],
        ['Monday', 1],
        ['Tuesday', 2],
        ['Wednesday', 3],
        ['Thursday', 4],
        ['Friday', 5],
        ['Saturday', 6],
    ]);

    const [strHours, strMinutes] = time.split(':');
    const [hours, minutes] = [Number(strHours), Number(strMinutes)];
    return getNormalizedTime(dayNames.get(dayName)!, hours, minutes);
}