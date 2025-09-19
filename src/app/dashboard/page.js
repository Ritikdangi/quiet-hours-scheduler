"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();

  // Load user and blocks
  useEffect(() => {
    async function loadUserAndBlocks() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      const res = await fetch("/api/blocks");
      const data = await res.json();
      setBlocks(Array.isArray(data) ? data : []); // ensure array
    }

    loadUserAndBlocks();
  }, [router]);

  const fetchBlocks = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch("/api/blocks", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setBlocks(Array.isArray(data) ? data : []);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch("/api/blocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ startTime, endTime }),
    });

    const data = await res.json();
    if (res.ok) {
      setMsg("✅ Block added");
      setStartTime("");
      setEndTime("");
      fetchBlocks();
    } else {
      setMsg("❌ " + data.error);
    }
  };

  const handleDelete = async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/blocks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      setBlocks(blocks.filter((b) => b._id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Dashboard</h1>
      {user && <p className="mb-4">Welcome, {user.email}</p>}

      <form onSubmit={handleAdd} className="space-y-3 mb-6 bg-gray-800 p-4 rounded-lg">
        <label className="block">
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </label>
        <label className="block">
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
            required
          />
        </label>
        <button type="submit" className="w-full p-2 bg-blue-600 rounded">
          ➕ Add Block
        </button>
      </form>
      {msg && <p className="mb-4">{msg}</p>}

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <p>No study blocks yet.</p>
        ) : (
          blocks.map((block) => (
            <div key={block._id} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg">
              <p>
                {new Date(block.startTime).toLocaleString()} → {new Date(block.endTime).toLocaleString()}
              </p>
              <button
                onClick={() => handleDelete(block._id)}
                className="bg-red-600 px-3 py-1 rounded"
              >
                🗑 Delete
              </button>
            </div>
          ))
        )}
      </div>

      <button onClick={handleLogout} className="mt-6 px-4 py-2 bg-red-600 rounded-lg">
        Logout
      </button>
    </div>
  );
}
