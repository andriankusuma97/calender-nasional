"use client";

import React, { useEffect, useState } from "react";
import ProfileModal from "./ProfileModal";
import AnnualRecap from "./AnnualRecap";
import { Camera, BarChart2 } from "lucide-react";

interface Profile {
  name?: string;
  photo?: string; // data URL
}

interface Props {
  transactions?: {
    id: string;
    date: Date | string;
    title?: string;
    amount: number;
    type?: "income" | "expense";
    category: string;
  }[];
}

export default function UserInfoClient({ transactions = [] }: Props) {
  const [profile, setProfile] = useState<Profile>({});
  const [open, setOpen] = useState(false);
  const [openRecap, setOpenRecap] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("profile_v1");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("profile_v1", JSON.stringify(profile));
    } catch {}
  }, [profile]);

  const handleSave = (p: Profile) => {
    setProfile(p);
    setOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100"
          title="Profil"
        >
          {profile.photo ? (
            <img
              src={profile.photo}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
              {profile.name
                ? profile.name.charAt(0).toUpperCase()
                : <Camera size={16} />}
            </div>
          )}
          <span className="sm:inline-block text-sm font-medium text-gray-700">
            {profile.name ? profile.name : "Pengguna"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setOpenRecap(true)}
          className="p-2 rounded-md hover:bg-gray-100"
          title="Rekap Tahunan"
        >
          <BarChart2 size={18} />
        </button>
      </div>

      <ProfileModal
        open={open}
        onClose={() => setOpen(false)}
        profile={profile}
        onSave={handleSave}
      />

      <AnnualRecap
        open={openRecap}
        onClose={() => setOpenRecap(false)}
        transactions={transactions}
      />
    </>
  );
}