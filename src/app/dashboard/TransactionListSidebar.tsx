"use client";
import React, { useMemo } from "react";
import { format, isSameMonth } from "date-fns";

export interface Transaction {
  id: string;
  date: Date | string;
  title?: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

interface Props {
  transactions: Transaction[];
  currentMonth: Date;
}

export default function TransactionListSidebar({ transactions, currentMonth }: Props) {
  const monthTransactions = useMemo(
    () => transactions.filter((t) => isSameMonth(new Date(t.date), currentMonth)),
    [transactions, currentMonth]
  );

  const monthTotal = monthTransactions.reduce((acc, t) => acc + t.amount, 0);

  // group by date (yyyy-MM-dd)
  const grouped = monthTransactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = format(new Date(t.date), "yyyy-MM-dd");
    acc[key] = acc[key] || [];
    acc[key].push(t);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <aside className="w-full border-l pl-4">
      <div className="sticky top-4 bg-white pb-4">
        <h3 className="text-md font-semibold mb-1">{format(currentMonth, "MMMM yyyy")}</h3>
        <div className="text-sm font-bold text-gray-700 mb-3">
          Total: <span className={monthTotal >= 0 ? "text-green-700" : "text-red-700"}>Rp {Math.abs(monthTotal).toLocaleString("id-ID")}{monthTotal > 0 ? "" : monthTotal < 0 ? "" : ""}</span>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-auto space-y-3">
        {sortedDates.length === 0 ? (
          <div className="text-sm text-gray-500">Belum ada transaksi di bulan ini.</div>
        ) : (
          sortedDates.map((dateKey) => {
            const items = grouped[dateKey];
            return (
              <div key={dateKey} className="bg-gray-50 p-2 rounded-md border">
                <div className="text-xs text-gray-500 font-medium mb-2">{format(new Date(dateKey), "dd MMM yyyy")}</div>
                <ul className="space-y-2">
                  {items.map((t) => (
                    <li key={t.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.title ?? t.category}</div>
                        <div className="text-xs text-gray-500">{t.category}</div>
                      </div>
                      <div className={`text-sm font-bold ml-4 ${t.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                        {t.amount > 0 ? "+" : "-"}Rp {Math.abs(t.amount).toLocaleString("id-ID")}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}