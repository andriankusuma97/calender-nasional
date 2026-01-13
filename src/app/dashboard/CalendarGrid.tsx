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
      // attach handlers on wrapping div so the whole calendar is swipeable
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="select-none"
    >
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
    </div>
  );
}