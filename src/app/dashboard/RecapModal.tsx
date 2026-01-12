"use client";
import React, { useMemo } from "react";
import { X } from "lucide-react";
import { isSameMonth, format } from "date-fns";

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
  currentMonth: Date;
}

export default function RecapModal({ open, onClose, transactions, currentMonth }: Props) {
  if (!open) return null;

  const monthTransactions = useMemo(
    () => transactions.filter((t) => isSameMonth(new Date(t.date), currentMonth)),
    [transactions, currentMonth]
  );

  const totalsByCategory = useMemo(() => {
    const map = new Map<string, number>();
    monthTransactions.forEach((t) => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
    });
    return Array.from(map.entries()).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  }, [monthTransactions]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    monthTransactions.forEach((t) => {
      const key = t.category;
      map.set(key, (map.get(key) || []).concat(t));
    });
    return Array.from(map.entries())
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        total: items.reduce((s, it) => s + it.amount, 0),
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [monthTransactions]);

  const overall = monthTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Rekap Bulanan</h3>
            <div className="text-sm text-gray-500">{format(currentMonth, "MMMM yyyy")}</div>
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
          <h4 className="text-sm font-medium mb-2">Per Kategori</h4>

          {totalsByCategory.length === 0 ? (
            <div className="text-sm text-gray-500 mb-3">Belum ada transaksi di bulan ini.</div>
          ) : (
            <ul className="space-y-3 max-h-[50vh] overflow-auto">
              {groupedByCategory.map((grp) => (
                <li key={grp.category} className="bg-gray-50 p-2 ">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium truncate">{grp.category}</div>
                    
                  </div>

                  <ul className="space-y-2 rounded-md border p-2">
                    {grp.items.map((t) => (
                      <li key={t.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{t.title ?? t.category}</div>
                          <div className="text-xs text-gray-500">{format(new Date(t.date), "dd MMM yyyy HH:mm")}</div>
                        </div>
                        <div className={`text-sm font-bold ml-4 ${t.amount > 0 ? "text-green-700" : "text-red-700"}`}>
                          {t.amount > 0 ? "+" : "-"}Rp {Math.abs(t.amount).toLocaleString("id-ID")}
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className={`text-sm text-right font-bold ${grp.total >= 0 ? "text-green-700" : "text-red-700"} p-2`}>
                      Rp {Math.abs(grp.total).toLocaleString("id-ID")}
                    </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Tutup</button>
        </div>
      </div>
    </div>
  );
}