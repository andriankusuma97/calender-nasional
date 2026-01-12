"use client";

import React from "react";
import { X, Edit2, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface TransactionItem {
  id: string;
  date: Date | string;
  title?: string;
  amount: number;
  type: "income" | "expense";
  category: string;
}

interface Props {
  showModal: boolean;
  setShowModal: (v: boolean) => void;
  selectedDate: Date | null;
  title?: string;
  setTitle?: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  type: "income" | "expense";
  setType: (v: "income" | "expense") => void;
  category: string;
  setCategory: (v: string) => void;
  handleAddTransaction: (e: React.FormEvent) => void;
  transactions?: TransactionItem[]; // existing prop
  onRequestEdit?: (id: string) => void; // new: meminta parent isi form utk edit
  onDeleteTransaction?: (id: string) => void; // new: minta parent hapus
  editingId?: string | null; // optional: untuk menandai mode edit
}

export default function TransactionModal({
  showModal,
  setShowModal,
  selectedDate,
  title,
  setTitle,
  amount,
  setAmount,
  type,
  setType,
  category,
  setCategory,
  handleAddTransaction,
  transactions = [],
  onRequestEdit,
  onDeleteTransaction,
  editingId = null,
}: Props) {
  if (!showModal) return null;

  const filtered = selectedDate
    ? transactions.filter((t) => isSameDay(new Date(t.date), selectedDate))
    : transactions;

  const formatDisplay = (val: string) => {
    const digits = val.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value || "";
    const normalized = raw.replace(/,/g, ".").replace(/[^\d]/g, "");
    setAmount(normalized);
  };

  const handleDelete = (id: string) => {
    if (!onDeleteTransaction) return;
    if (!confirm("Hapus transaksi ini?")) return;
    onDeleteTransaction(id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 w-full h-[85vh] sm:h-auto max-w-md shadow-2xl overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">
            {editingId ? "Edit Transaksi" : "Tambah Transaksi"} -{" "}
            {selectedDate && format(selectedDate, "dd MMM yyyy")}
          </h3>
          <button onClick={() => setShowModal(false)}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleAddTransaction} className="space-y-4">
          {typeof setTitle === "function" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Title (Nama Aktivitas)
              </label>
              <input
                type="text"
                value={title ?? ""}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Beli makanan, Gaji bulan Januari"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Tipe</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`py-2 rounded-lg border ${
                  type === "expense"
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white"
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("income")}
                className={`py-2 rounded-lg border ${
                  type === "income"
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white"
                }`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nominal (Rp)</label>
            <input
              type="text"
              value={formatDisplay(amount)}
              onChange={handleAmountInput}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: 50.000"
              inputMode="numeric"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option>Makan</option>
              <option>Transportasi</option>
              <option>Gaji</option>
              <option>Hiburan</option>
              <option>Tagihan</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
          >
            {editingId ? "Perbarui Transaksi" : "Simpan Transaksi"}
          </button>
        </form>

        {/* daftar budgeting / transaksi */}
        <div className="mt-6">
          <h4 className="text-sm font-semibold mb-2">Daftar Budgeting</h4>
          {filtered.length === 0 ? (
            <div className="text-sm text-gray-500">
              Belum ada transaksi untuk tanggal ini.
            </div>
          ) : (
            <ul className="space-y-2 max-h-40 overflow-auto">
              {filtered.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {(t as any).title ?? t.category}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.category} •{" "}
                      {format(new Date(t.date), "dd MMM yyyy HH:mm")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`text-sm font-bold ml-2 ${
                        t.amount > 0 ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {t.amount > 0 ? "+" : "-"}Rp{" "}
                      {Math.abs(t.amount).toLocaleString("id-ID")}
                    </div>

                    <button
                      type="button"
                      onClick={() => onRequestEdit && onRequestEdit(t.id)}
                      className="p-1 rounded-md hover:bg-gray-100"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="p-1 rounded-md hover:bg-gray-100"
                      title="Hapus"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}