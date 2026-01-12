"use client";

import React, { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";

interface Profile {
  name?: string;
  photo?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  profile?: Profile;
  onSave: (p: Profile) => void;
}

export default function ProfileModal({ open, onClose, profile = {}, onSave }: Props) {
  const [name, setName] = useState(profile.name ?? "");
  const [photo, setPhoto] = useState<string | undefined>(profile.photo);

  useEffect(() => {
    if (open) {
      setName(profile.name ?? "");
      setPhoto(profile.photo);
    }
  }, [open, profile]);

  if (!open) return null;

  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({ name: name.trim() || undefined, photo });
  };

  const handleClearPhoto = () => setPhoto(undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Profil Saya</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            {photo ? (
              <img src={photo} alt="preview" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">No</div>
            )}

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Nama Anda"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Foto</label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="text-sm bg-green-300 p-2 rounded-md border cursor-pointer"
              />
              {photo && (
                <button type="button" onClick={handleClearPhoto} className="p-2 rounded-md hover:bg-gray-100" title="Hapus foto">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Foto disimpan di browser (localStorage).</p>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border hover:bg-gray-50">Batal</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white">Simpan</button>
          </div>
        </div>
      </div>
    </div>
  );
}