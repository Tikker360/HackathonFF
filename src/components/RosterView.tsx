"use client";

export default function RosterView({ userId }: { userId: string }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 p-8">
      <h1 className="text-2xl font-bold">Roster View</h1>
      <p className="text-zinc-500 mt-2">Viewing user: {userId}</p>
    </div>
  );
}
