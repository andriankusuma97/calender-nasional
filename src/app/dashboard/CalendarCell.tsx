"use client";
import React from "react";
import { format, isSameMonth, isSameDay } from "date-fns";

interface Holiday {
  date: string;
  name: string;
  dateObj?: Date;
}

interface Props {
  day: Date;
  currentMonth: Date;
  holiday?: Holiday | undefined;
  setSelectedDate: (d: Date) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getDayData: (d: Date) => { dayTrans: any[]; total: number };
}

export default function CalendarCell({ day, currentMonth, holiday, setSelectedDate, getDayData }: Props) {
  const { total } = getDayData(day);
  const isCurrentMonth = isSameMonth(day, currentMonth);
  const isToday = isSameDay(day, new Date());
  const isSunday = day.getDay() === 0;
  const isHoliday = Boolean(holiday);

  const outerTextClass = !isCurrentMonth
    ? "bg-gray-50 text-gray-300"
    : isToday
      ? "text-gray-700"
      : isHoliday
        ? "text-red-700"
        : isSunday
          ? "text-red-700"
          : "text-gray-700";

  return (
    <div
      onClick={() => { setSelectedDate(day); }}
      className={`h-20 sm:h-28 border-r border-b p-1 sm:p-2 cursor-pointer transition-all hover:bg-blue-50 ${outerTextClass} ${isToday ? "bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-300" : ""} ${isHoliday ? "bg-red-50" : ""} flex flex-col justify-between overflow-hidden`}
    >
      <div className="grid grid-cols-[auto_1fr] items-center gap-2 min-w-0">
        <div className={`text-left text-sm font-semibold flex-none ${isToday ? "text-blue-800 font-extrabold" : ""}`}>
          <span className={
            isToday
              ? "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm relative z-10"
              : (isHoliday || isSunday ? "inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm relative z-10" : "text-xs sm:text-sm relative z-10")
          }>
            {format(day, "d")}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 justify-end">
            {isToday && <div className="hidden sm:block text-xs text-blue-600 font-medium truncate whitespace-nowrap max-w-[80px]">Hari ini</div>}
            {isHoliday && (
              <div className="text-[10px] sm:text-xs text-red-600 font-medium truncate whitespace-nowrap max-w-[90px] sm:max-w-[110px]">
                {holiday?.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {total !== 0 && (
        <div className={`mt-2 text-[10px] p-1 rounded font-bold truncate overflow-hidden whitespace-nowrap ${total > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          Rp {Math.abs(total).toLocaleString("id-ID")}
        </div>
      )}
    </div>
  );
}