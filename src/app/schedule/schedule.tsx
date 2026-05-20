'use client';

import { useState } from 'react';

const days: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hours: string[] = Array.from({ length: 12 }, (_, i) => `${i + 12}PM`); // 12PM - 11PM

export default function SchedulePage() {
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  const toggleSlot = (day: string, hour: string) => {
    const key = `${day}-${hour}`;
    setSelectedSlots((prev) => {
      const newSet = new Set(prev);
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  return (
    <div className="flex flex-col items-center bg-blue-900 min-h-screen p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Schedule Creation Page</h1>
      <div className="w-full max-w-4xl bg-blue-700 p-4 rounded-lg">
        {/* Schedule Grid */}
        <div className="grid grid-cols-8 gap-2 bg-blue-600 p-4 rounded-lg">
          {/* Days Header */}
          <div className=""></div> {/* Empty top-left corner */}
          {days.map((day) => (
            <div key={day} className="text-center font-bold bg-blue-500 p-2 rounded">
              {day}
            </div>
          ))}
          
          {/* Time Slots */}
          {hours.map((hour) => (
            <>
              <div key={hour} className="text-right pr-2 font-bold text-lg">{hour}</div>
              {days.map((day) => {
                const isSelected = selectedSlots.has(`${day}-${hour}`);
                return (
                  <div
                    key={`${day}-${hour}`}
                    className={`h-12 w-full flex items-center justify-center rounded cursor-pointer transition-all ${
                      isSelected ? 'bg-blue-300' : 'bg-blue-500'
                    }`}
                    onClick={() => toggleSlot(day, hour)}
                  ></div>
                );
              })}
            </>
          ))}
        </div>

        {/* Button */}
        <button className="w-full bg-blue-800 text-white p-4 mt-4 rounded-lg hover:bg-blue-600 transition">
          Mark Off Your Availabilities
        </button>
      </div>
    </div>
  );
}
