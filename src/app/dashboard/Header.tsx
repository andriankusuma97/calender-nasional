"use client";

import React from "react";
import { addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  currentMonth: Date;
  setCurrentMonth: (d: Date) => void;
  formatMonth: (d: Date) => string;
}

export default function Header({ currentMonth, setCurrentMonth, formatMonth }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
      <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{formatMonth(currentMonth)}</h2>
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 sm:p-2 border rounded-full hover:bg-gray-50">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 sm:p-2 border rounded-full hover:bg-gray-50">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}