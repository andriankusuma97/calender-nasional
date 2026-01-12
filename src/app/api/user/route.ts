import { NextResponse } from 'next/server';

export async function GET() {
  // ganti ini dengan lookup session / DB nyata (NextAuth, cookies, dsb.)
  const user = { id: 'u1', name: 'Andrian Kusuma', email: 'budi@example.com' };
  return NextResponse.json(user);
}