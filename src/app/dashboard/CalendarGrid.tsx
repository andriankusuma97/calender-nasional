"use client";
import React from "react";
import { format, isSameMonth, isSameDay } from "date-fns";
import CalendarCell from "./CalendarCell";

interface Holiday {
  date: string;
  name: string;
  dateObj?: Date;
}

interface Props {
  days: Date[];
  currentMonth: Date;
  parsedHolidays: Holiday[];
  setSelectedDate: (d: Date) => void;
  getDayData: (d: Date) => { dayTrans: any[]; total: number };
}

export default function CalendarGrid({ days, currentMonth, parsedHolidays, setSelectedDate, getDayData }: Props) {
  return (
    <>
      <div className="grid grid-cols-7 border-l border-t text-center text-[11px] sm:text-sm">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, idx) => (
          <div
            key={d}
            className={`py-2 border-r border-b bg-gray-50 text-xs font-bold uppercase ${idx === 0 ? "text-red-500" : "text-gray-500"}`}
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const holiday = parsedHolidays.find((h) => isSameDay(h.dateObj!, day));
          return (
            <CalendarCell
              key={day.getTime()}
              day={day}
              currentMonth={currentMonth}
              holiday={holiday}
              setSelectedDate={setSelectedDate}
              getDayData={getDayData}
            />
          );
        })}
      </div>
    </>
  );
}