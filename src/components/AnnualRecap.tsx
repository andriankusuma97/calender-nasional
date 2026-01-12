"use client";
import React, { useMemo } from "react";
import { X } from "lucide-react";
import { format, getYear, isSameYear } from "date-fns";

interface Transaction {
  id: string;
  date: Date | string;
  title?: string;
  amount: number;
  type?: "income" | "expense";
  category: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  transactions: Transaction[];
  year?: number;
}

export default function AnnualRecap({ open, onClose, transactions, year }: Props) {
  if (!open) return null;
  const targetYear = year ?? getYear(new Date());

  const txThisYear = useMemo(
    () => transactions.filter((t) => isSameYear(new Date(t.date), new Date(targetYear, 0, 1))),
    [transactions, targetYear]
  );

  const totalsByMonth = useMemo(() => {
    const arr = Array.from({ length: 12 }, (_, i) => ({ monthIndex: i, total: 0 }));
    txThisYear.forEach((t) => {
      const d = new Date(t.date);
      arr[d.getMonth()].total += t.amount;
    });
    return arr;
  }, [txThisYear]);

  const overall = txThisYear.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Rekap Tahunan</h3>
            <div className="text-sm text-gray-500">{targetYear}</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500">Total Keseluruhan</div>
          <div className={`text-xl font-bold ${overall >= 0 ? "text-green-700" : "text-red-700"}`}>
            Rp {Math.abs(overall).toLocaleString("id-ID")} {overall < 0 ? "(negatif)" : ""}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Per Bulan</h4>
          <ul className="space-y-2 max-h-[50vh] overflow-auto">
            {totalsByMonth.map((m) => (
              <li key={m.monthIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                <div className="text-sm">{format(new Date(targetYear, m.monthIndex, 1), "MMMM")}</div>
                <div className={`text-sm font-bold ${m.total >= 0 ? "text-green-700" : "text-red-700"}`}>
                  {m.total >= 0 ? "+" : "-"}Rp {Math.abs(m.total).toLocaleString("id-ID")}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}