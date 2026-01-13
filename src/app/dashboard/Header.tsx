"use client";

import React from "react";
import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;
  formatMonth: (d: Date) => string;
}

export default function Header({
  currentMonth,
  setCurrentMonth,
  formatMonth,
}: Props) {
  return (
    <div className="flex flex-row items-start sm:items-center justify-between mb-6 gap-3 w-auto px-4">
      <button
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        className="p-1 border rounded-full hover:bg-gray-50"
      >
        <ChevronLeft size={18} />
      </button>
      <h2 className="text-md font-bold text-gray-800">
        {formatMonth(currentMonth)}
      </h2>

      <button
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        className="p-1  border rounded-full hover:bg-gray-50"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
