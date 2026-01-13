"use client";

import React, { useMemo, useState } from "react";
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

  // collapsed state per category (short = collapse)
  const [collapsedMap, setCollapsedMap] = useState<Record<string, boolean>>({});
  // sort direction per category: true = ascending by absolute amount (kecil -> besar)
  const [sortAscMap, setSortAscMap] = useState<Record<string, boolean>>({});

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
        // default order: newest first
        items: items.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        total: items.reduce((s, it) => s + it.amount, 0),
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }, [monthTransactions]);

  const overall = monthTransactions.reduce((acc, t) => acc + t.amount, 0);

  const toggleCollapse = (category: string) => {
    setCollapsedMap((s) => ({ ...s, [category]: !s[category] }));
  };

  const toggleSortAsc = (category: string) => {
    setSortAscMap((s) => ({ ...s, [category]: !s[category] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-gradient-to-br from-white to-indigo-50 rounded-t-xl sm:rounded-xl p-4 sm:p-6 shadow-2xl ring-1 ring-indigo-100 max-h-[90vh] overflow-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Rekap Bulanan</h3>
            <div className="text-sm text-gray-500">{format(currentMonth, "MMMM yyyy")}</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="mb-4">
          <div className="text-sm text-gray-500">Total Keseluruhan</div>
          <div className={`text-xl font-extrabold ${overall >= 0 ? "text-green-700" : "text-rose-700"}`}>
            Rp {Math.abs(overall).toLocaleString("id-ID")} {overall < 0 ? "(negatif)" : ""}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Per Kategori</h4>

          {totalsByCategory.length === 0 ? (
            <div className="text-sm text-gray-500 mb-3">Belum ada transaksi di bulan ini.</div>
          ) : (
            <ul className="space-y-3 max-h-[60vh] overflow-auto">
              {groupedByCategory.map((grp) => {
                const isCollapsed = Boolean(collapsedMap[grp.category]);
                const sortAsc = Boolean(sortAscMap[grp.category]);

                // Items to display: when sortAsc true -> absolute amount ascending (kecil -> besar)
                // when sortAsc false -> absolute amount descending (besar -> kecil)
                const itemsToDisplay = grp.items.slice().sort((a, b) =>
                  sortAsc ? Math.abs(a.amount) - Math.abs(b.amount) : Math.abs(b.amount) - Math.abs(a.amount)
                );

                return (
                  <li key={grp.category} className="bg-gray-50 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-yellow-400" />
                        <div className="text-sm font-medium truncate">{grp.category}</div>
                        

                        {/* Collapse/expand */}
                        <button
                          type="button"
                          onClick={() => toggleCollapse(grp.category)}
                          className="text-xs px-2 py-1 rounded-md bg-white/90 border hover:bg-gray-100"
                          title={isCollapsed ? "Tampilkan transaksi" : "Sembunyikan transaksi"}
                        >
                          {isCollapsed ? "Show" : "Hide"}
                        </button>
                        {/* Sort button: toggles ascending by absolute amount (kecil -> besar) */}
                        <button
                          type="button"
                          onClick={() => toggleSortAsc(grp.category)}
                          className={`text-xs px-2 py-1 rounded-md bg-white/90 border hover:bg-gray-100 ${!isCollapsed && itemsToDisplay.length > 1  ? "" : "hidden"}`}
                          title={sortAsc ? "Urutkan dari terkecil ke terbesar (aktif)" : "Urutkan dari terbesar ke terkecil"}
                        >
                          {sortAsc ? "Asc ↑" : "Short ↓"}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 ">
                        <div className={`text-sm font-bold ${grp.total >= 0 ? "text-green-700" : "text-rose-700"} px-2`}>
                          {grp.total >= 0 ? "+" : "-"}Rp {Math.abs(grp.total).toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>

                    {isCollapsed ? (
                      <div className="text-xs text-gray-500">({grp.items.length} transaksi)</div>
                    ) : (
                      <ul className="space-y-2 rounded-md border-2  p-2 border-gray-300 ">
                        {itemsToDisplay.map((t) => (
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
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}