"use client";
import React, { useRef } from "react";
import { format, isSameMonth, isSameDay } from "date-fns";
import CalendarCell from "./CalendarCell";
import { log } from "console";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDayData: (d: Date) => { dayTrans: any[]; total: number };
  onPrevMonth?: () => void; // new
  onNextMonth?: () => void; // new
}

export default function CalendarGrid({
  days,
  currentMonth,
  parsedHolidays,
  setSelectedDate,
  getDayData,
  onPrevMonth,
  onNextMonth,
}: Props) {
  const startXRef = useRef<number | null>(null);
  const threshold = 50; // px

  const handleTouchStart: React.TouchEventHandler = (e) => {
    startXRef.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd: React.TouchEventHandler = (e) => {
    const endX = e.changedTouches[0]?.clientX ?? null;
    if (startXRef.current == null || endX == null) return;
    const dx = endX - startXRef.current;
    if (dx > threshold) {
      // swipe right -> previous month
      onPrevMonth && onPrevMonth();
    } else if (dx < -threshold) {
      // swipe left -> next month
      onNextMonth && onNextMonth();
    }
    startXRef.current = null;
  };

  // optional: basic mouse drag support for desktop
  const mouseDown = useRef(false);
  const mouseStartX = useRef<number | null>(null);

  const handleMouseDown: React.MouseEventHandler = (e) => {
    mouseDown.current = true;
    mouseStartX.current = e.clientX;
  };
  const handleMouseUp: React.MouseEventHandler = (e) => {
    if (!mouseDown.current || mouseStartX.current == null) {
      mouseDown.current = false;
      mouseStartX.current = null;
      return;
    }
    const dx = e.clientX - mouseStartX.current;
    if (dx > threshold) {
      onPrevMonth && onPrevMonth();
    } else if (dx < -threshold) {
      onNextMonth && onNextMonth();
    }
    mouseDown.current = false;
    mouseStartX.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="select-none"
    >
      <div className="grid grid-cols-7 text-center text-xs rounded-2xl md:gap-4 sm:gap-0">
        {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, idx) => (
          <div
            key={d}
            className={`py-3  rounded-2xl font-semibold uppercase ${
              idx === 0
                ? " text-red-600"
                
                : "bg-gradient-to-r from-white to-slate-50 text-slate-600"
            }`}
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
    </div>
  );
}