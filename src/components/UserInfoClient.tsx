"use client";
import React, { useEffect, useState } from 'react';

export default function UserInfoClient() {
  const [user, setUser] = useState<{id:string; name:string; email:string} | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/user')
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (mounted) setUser(data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  if (!user) return <div className="text-sm text-gray-500">Loading user…</div>;
  return <div className="text-sm text-gray-700">Halo, {user.name}</div>;
}