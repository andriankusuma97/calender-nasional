"use client";

import React, { useState, useMemo } from 'react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval,
  parseISO, startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import UserInfoClient from '../components/UserInfoClient';

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

// tambahkan data hari libur nasional (contoh — sesuaikan / perluas)
const HOLIDAYS = [
  // Hari Libur Nasional
  { date: '2026-01-01', name: 'Tahun Baru Masehi' },
  { date: '2026-01-16', name: 'Isra Mi’raj Nabi Muhammad SAW' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili' },
  { date: '2026-03-19', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)' },
  { date: '2026-03-21', name: 'Idulfitri 1447 H (Hari Pertama)' },
  { date: '2026-03-22', name: 'Idulfitri 1447 H (Hari Kedua)' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)' },
  { date: '2026-04-05', name: 'Kebangkitan Yesus Kristus (Paskah)' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus' },
  { date: '2026-05-27', name: 'Iduladha 1447 H' },
  { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila' },
  { date: '2026-06-16', name: '1 Muharram Tahun Baru Islam 1448 H' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan Republik Indonesia' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW' },
  { date: '2026-12-25', name: 'Hari Raya Natal' },

  // Cuti Bersama
  { date: '2026-02-16', name: 'Cuti Bersama Tahun Baru Imlek' },
  { date: '2026-03-18', name: 'Cuti Bersama Hari Suci Nyepi' },
  { date: '2026-03-20', name: 'Cuti Bersama Idulfitri 1447 H' },
  { date: '2026-03-23', name: 'Cuti Bersama Idulfitri 1447 H' },
  { date: '2026-03-24', name: 'Cuti Bersama Idulfitri 1447 H' },
  { date: '2026-05-15', name: 'Cuti Bersama Kenaikan Yesus Kristus' },
  { date: '2026-05-28', name: 'Cuti Bersama Iduladha 1447 H' },
  { date: '2026-12-24', name: 'Cuti Bersama Natal' },
];


export default function FinanceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Makan');

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end: endOfWeek(endOfMonth(currentMonth)),
  });

  // pre-parse holiday dates untuk perbandingan cepat
  const parsedHolidays = useMemo(() => HOLIDAYS.map(h => ({
    ...h,
    dateObj: startOfDay(parseISO(h.date))
  })), []);

  // cari hari libur yang ada di rentang tampilan (untuk ditampilkan note)
  const visibleHolidays = useMemo(() => {
    return parsedHolidays.filter(h => days.some(d => isSameDay(d, h.dateObj)));
  }, [parsedHolidays, days]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !amount) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      amount: type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount)),
      type,
      category,
    };

    setTransactions([...transactions, newTransaction]);
    setShowModal(false);
    setAmount('');
  };

  const getDayData = (day: Date) => {
    const dayTrans = transactions.filter(t => isSameDay(t.date, day));
    const total = dayTrans.reduce((acc, curr) => acc + curr.amount, 0);
    return { dayTrans, total };
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 bg-white rounded-xl shadow-lg relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block"><UserInfoClient /></div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 sm:p-2 border rounded-full hover:bg-gray-50"><ChevronLeft size={18}/></button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 sm:p-2 border rounded-full hover:bg-gray-50"><ChevronRight size={18}/></button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-l border-t text-center text-[11px] sm:text-sm">
        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d, idx) => (
          <div
            key={d}
            className={`py-2 border-r border-b bg-gray-50 text-xs font-bold uppercase ${idx === 0 ? 'text-red-500' : 'text-gray-500'}`}
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const { total } = getDayData(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isSunday = day.getDay() === 0;

          // cek apakah hari ini hari libur nasional
          const holiday = parsedHolidays.find(h => isSameDay(h.dateObj, day));
          const isHoliday = Boolean(holiday);

          // decide outer text color / muted state
          const outerTextClass = !isCurrentMonth
            ? 'bg-gray-50 text-gray-300'
            : isToday
              ? 'text-gray-700'
              : isHoliday
                ? 'text-red-700'
                : isSunday
                  ? 'text-red-700'
                  : 'text-gray-700';

          return (
            <div 
              key={day.getTime()}
              onClick={() => { setSelectedDate(day); setShowModal(true); }}
              className={`h-20 sm:h-28 border-r border-b p-1 sm:p-2 cursor-pointer transition-all hover:bg-blue-50 ${outerTextClass} ${isToday ? 'bg-gradient-to-br from-blue-50 to-white ring-2 ring-blue-300' : ''} ${isHoliday ? 'bg-red-50' : ''} flex flex-col justify-between overflow-hidden`}
            >
              <div className="grid grid-cols-[auto_1fr] items-center gap-2 min-w-0">
                <div className={`text-left text-sm font-semibold flex-none ${isToday ? 'text-blue-800 font-extrabold' : ''}`}>
                  <span className={
                    isToday
                      ? 'inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-100 text-blue-800 text-xs sm:text-sm relative z-10'
                      : (isHoliday || isSunday ? 'inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm relative z-10' : 'text-xs sm:text-sm relative z-10')
                  }>
                    {format(day, 'd')}
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
                <div className={`mt-2 text-[10px] p-1 rounded font-bold truncate overflow-hidden whitespace-nowrap ${total > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  Rp {Math.abs(total).toLocaleString('id-ID')}
                </div>
              )}
            </div>
          );
        })}
       </div>

      {/* Keterangan hari libur yang tampil pada bulan ini */}
      {visibleHolidays.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <h4 className="text-sm font-semibold text-red-700 mb-2">Hari Libur Nasional</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {visibleHolidays.map(h => (
              <li key={h.date}>
                <span className="font-medium">{format(h.dateObj, 'dd MMM yyyy')}</span> — {h.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 w-full h-[85vh] sm:h-auto max-w-md shadow-2xl overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Tambah Transaksi - {selectedDate && format(selectedDate, 'dd MMM yyyy')}</h3>
              <button onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipe</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setType('expense')} className={`py-2 rounded-lg border ${type === 'expense' ? 'bg-red-500 text-white border-red-500' : 'bg-white'}`}>Pengeluaran</button>
                  <button type="button" onClick={() => setType('income')} className={`py-2 rounded-lg border ${type === 'income' ? 'bg-green-500 text-white border-green-500' : 'bg-white'}`}>Pemasukan</button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nominal (Rp)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: 50000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-lg">
                  <option>Makan</option>
                  <option>Transportasi</option>
                  <option>Gaji</option>
                  <option>Hiburan</option>
                  <option>Tagihan</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                Simpan Transaksi
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
