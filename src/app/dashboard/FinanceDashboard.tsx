"use client";
import React, { useMemo, useState, useEffect } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, startOfDay, isSameDay, isSameMonth, } from "date-fns";

import Header from "./Header";
import CalendarGrid from "./CalendarGrid";
import TransactionModal from "./TransactionModal";
import TransactionListSidebar from "./TransactionListSidebar";
import UserInfoClient from "../../components/UserInfoClient";

export interface Transaction {
  id: string;
  date: Date;
  title?: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

const HOLIDAYS = [
  { date: "2026-01-01", name: "Tahun Baru Masehi" },
  { date: "2026-01-16", name: "Isra Mi’raj Nabi Muhammad SAW" },
  { date: "2026-02-17", name: "Tahun Baru Imlek 2577 Kongzili" },
  { date: "2026-03-19", name: "Hari Suci Nyepi (Tahun Baru Saka 1948)" },
  { date: "2026-03-21", name: "Idulfitri 1447 H (Hari Pertama)" },
  { date: "2026-03-22", name: "Idulfitri 1447 H (Hari Kedua)" },
  { date: "2026-04-03", name: "Wafat Yesus Kristus (Jumat Agung)" },
  { date: "2026-04-05", name: "Kebangkitan Yesus Kristus (Paskah)" },
  { date: "2026-05-01", name: "Hari Buruh Internasional" },
  { date: "2026-05-14", name: "Kenaikan Yesus Kristus" },
  { date: "2026-05-27", name: "Iduladha 1447 H" },
  { date: "2026-05-31", name: "Hari Raya Waisak 2570 BE" },
  { date: "2026-06-01", name: "Hari Lahir Pancasila" },
  { date: "2026-06-16", name: "1 Muharram Tahun Baru Islam 1448 H" },
  { date: "2026-08-17", name: "Hari Kemerdekaan Republik Indonesia" },
  { date: "2026-08-25", name: "Maulid Nabi Muhammad SAW" },
  { date: "2026-12-25", name: "Hari Raya Natal" },
  { date: "2026-02-16", name: "Cuti Bersama Tahun Baru Imlek" },
  { date: "2026-03-18", name: "Cuti Bersama Hari Suci Nyepi" },
  { date: "2026-03-20", name: "Cuti Bersama Idulfitri 1447 H" },
  { date: "2026-03-23", name: "Cuti Bersama Idulfitri 1447 H" },
  { date: "2026-03-24", name: "Cuti Bersama Idulfitri 1447 H" },
  { date: "2026-05-15", name: "Cuti Bersama Kenaikan Yesus Kristus" },
  { date: "2026-05-28", name: "Cuti Bersama Iduladha 1447 H" },
  { date: "2026-12-24", name: "Cuti Bersama Natal" },
];

export default function FinanceDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState(""); // stored as plain digits string, no separators
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Makan");
  const [editingId, setEditingId] = useState<string | null>(null);

  // persist to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("transactions_v1");
      if (raw) {
        const parsed = JSON.parse(raw) as any[];
        setTransactions(
          parsed.map((t) => ({
            ...t,
            date: new Date(t.date),
          }))
        );
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("transactions_v1", JSON.stringify(transactions));
    } catch (err) {
      // ignore
    }
  }, [transactions]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  const parsedHolidays = useMemo(
    () =>
      HOLIDAYS.map((h) => ({
        ...h,
        dateObj: startOfDay(parseISO(h.date)),
      })),
    []
  );

  const visibleHolidays = useMemo(
    () => parsedHolidays.filter((h) => days.some((d) => isSameDay(d, h.dateObj))),
    [parsedHolidays, days]
  );

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !amount) return;

    const parsedAmount = type === "expense" ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    if (editingId) {
      // update existing
      setTransactions((s) =>
        s.map((t) =>
          t.id === editingId
            ? { ...t, title: title || undefined, date: selectedDate, amount: parsedAmount, type, category }
            : t
        )
      );
      setEditingId(null);
    } else {
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(2, 11),
        date: selectedDate,
        title: title || undefined,
        amount: parsedAmount,
        type,
        category,
      };
      setTransactions((s) => [...s, newTransaction]);
    }

    setShowModal(false);
    setAmount("");
    setTitle("");
    setType("expense");
    setCategory("Makan");
  };

  const handleRequestEdit = (id: string) => {
    const t = transactions.find((x) => x.id === id);
    if (!t) return;
    setTitle(t.title ?? "");
    setAmount(String(Math.abs(t.amount)));
    setType(t.type);
    setCategory(t.category);
    setSelectedDate(new Date(t.date));
    setEditingId(id);
    setShowModal(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    setTransactions((s) => s.filter((t) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setShowModal(false);
    }
  };

  const getDayData = (day: Date | null) => {
    if (!day) {
      return { dayTrans: [] as Transaction[], total: 0 };
    }
    const dayTrans = transactions.filter((t) => isSameDay(new Date(t.date), day));
    const total = dayTrans.reduce((acc, curr) => acc + curr.amount, 0);
    return { dayTrans, total };
  };

  return (
    <div className="w-full md:w-[80%] h-screen hide-scrollbar mx-auto p-6 pb-8 rounded-2xl shadow-2xl relative ring-1 ring-indigo-100 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-pink-600 to-yellow-600">
          Dashboard
        </h1>
        <div className="sm:block flex items-center gap-2">
          <UserInfoClient transactions={transactions} />
        </div>
      </div>

      {/* content area: scrollable but scrollbar hidden */}
      <div className="flex-1 overflow-auto [scrollbar-width:none]">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-4">
          <div>
            <Header
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              formatMonth={(d: Date) => format(d, "MMMM yyyy")}
            />
            <CalendarGrid
              days={days}
              currentMonth={currentMonth}
              parsedHolidays={parsedHolidays}
              setSelectedDate={(d: Date) => {
                setSelectedDate(d);
                setShowModal(true);
              }}
              getDayData={getDayData}
              onPrevMonth={() => setCurrentMonth((m) => subMonths(m, 1))}
              onNextMonth={() => setCurrentMonth((m) => addMonths(m, 1))}
            />

            {visibleHolidays.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                <h4 className="text-sm font-semibold text-red-700 mb-2">Hari Libur Nasional</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  {visibleHolidays.map((h) => (
                    <li key={h.date}>
                      <span className="font-medium">{format(h.dateObj, "dd MMM yyyy")}</span> — {h.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* mobile: tampilkan sidebar di bawah kalender & keterangan libur */}
            <div className="block md:hidden mt-4">
              <TransactionListSidebar transactions={transactions} currentMonth={currentMonth} />
            </div>
          </div>

          {/* desktop: sidebar di kanan */}
          <div className="hidden md:block">
            <TransactionListSidebar transactions={transactions} currentMonth={currentMonth} />
          </div>
        </div>
      </div>

      <TransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        selectedDate={selectedDate}
        title={title}
        setTitle={setTitle}
        amount={amount}
        setAmount={setAmount}
        type={type}
        setType={setType}
        category={category}
        setCategory={setCategory}
        handleAddTransaction={handleAddTransaction}
        transactions={transactions}
        onRequestEdit={handleRequestEdit}
        onDeleteTransaction={handleDeleteTransaction}
        editingId={editingId}
        getDayData={getDayData}
        

      />
    </div>
  );
}