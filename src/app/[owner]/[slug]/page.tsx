"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

interface ListItem {
  id: string;
  item: string;
  completed: boolean;
  added_by: string;
  list_name: string;
  list_slug: string;
  owner: string;
  priority: string | null;
  due_date: string | null;
  reminder_enabled: boolean;
  created_at: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" });
}

export default function ListPage() {
  const params = useParams();
  const router = useRouter();
  const owner = params.owner as string;
  const slug = params.slug as string;

  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [priority, setPriority] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState("");
  const [reminder, setReminder] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const ownerName = owner === "ryan" ? "Ryan" : "Emily";
  const ownerColor = owner === "ryan" ? "amber" : "rose";

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/items?owner=${owner}&slug=${slug}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [owner, slug]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: trimmed,
          added_by: "web",
          owner,
          list_slug: slug,
          priority: priority || undefined,
          due_date: dueDate || undefined,
          reminder_enabled: reminder,
        }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const added = await res.json();
      setItems((prev) => [added, ...prev]);
      setNewItem("");
      setPriority(null);
      setDueDate("");
      setReminder(false);
      setShowForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleItem = async (id: string, completed: boolean) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !completed } : i))
    );
    await fetch("/api/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/items?id=${id}`, { method: "DELETE" });
  };

  const clearCompleted = async () => {
    const ids = items.filter((i) => i.completed).map((i) => i.id);
    if (!ids.length) return;
    setItems((prev) => prev.filter((i) => !i.completed));
    for (const id of ids) {
      await fetch(`/api/items?id=${id}`, { method: "DELETE" });
    }
  };

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);
  const completedCount = completedItems.length;
  const totalCount = items.length;
  const listName = items[0]?.list_name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-lg px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Image src="/crest.png" alt="Drake" width={32} height={32} className="rounded" />
            <span className="text-lg font-serif font-bold text-black tracking-tight">DRAKE</span>
          </div>
          <button onClick={() => router.push("/")} className="text-zinc-400 hover:text-zinc-600 text-sm">
            Switch
          </button>
        </div>

        {/* Greeting */}
        <p className="text-2xl font-serif font-bold text-black mt-6">
          {getGreeting()}, {ownerName}.
        </p>
        <p className="text-zinc-400 text-sm mt-0.5">Here&apos;s your list.</p>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  owner === "ryan" ? "bg-amber-500" : "bg-rose-400"
                }`}
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 tabular-nums">
              {completedCount} / {totalCount}
            </span>
          </div>
        )}

        {/* Add item */}
        <div className="mt-5">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 transition-colors text-sm font-medium"
            >
              + Add item
            </button>
          ) : (
            <div className="border border-zinc-200 rounded-xl p-3 space-y-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="What needs doing?"
                className="w-full px-0 py-1 text-base placeholder-zinc-400 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") addItem();
                  if (e.key === "Escape") setShowForm(false);
                }}
              />
              <div className="flex gap-2 flex-wrap">
                <select
                  value={priority || ""}
                  onChange={(e) => setPriority(e.target.value || null)}
                  className="text-xs px-2 py-1 rounded-md border border-zinc-200 text-zinc-600"
                >
                  <option value="">No priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="text-xs px-2 py-1 rounded-md border border-zinc-200 text-zinc-600"
                />
                <label className="flex items-center gap-1 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={reminder}
                    onChange={(e) => setReminder(e.target.checked)}
                    className="rounded"
                  />
                  Remind me
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addItem}
                  disabled={!newItem.trim()}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    owner === "ryan"
                      ? "bg-amber-500 text-white hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-400"
                      : "bg-rose-400 text-white hover:bg-rose-500 disabled:bg-zinc-200 disabled:text-zinc-400"
                  }`}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-1.5 rounded-lg text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* List name */}
        <h2 className="text-base font-bold text-black mt-6 mb-1">{listName}</h2>

        {/* Active items */}
        {loading ? (
          <p className="text-zinc-400 text-sm mt-4">Loading...</p>
        ) : (
          <ul className="mt-1">
            {activeItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 py-2.5 border-b border-zinc-50 group"
              >
                <button
                  onClick={() => toggleItem(item.id, item.completed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? "bg-green-500 border-green-500"
                      : "border-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  {item.completed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-zinc-800 block truncate">{item.item}</span>
                  <div className="flex gap-2 mt-0.5">
                    {item.priority && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[item.priority]}`}>
                        {PRIORITY_LABELS[item.priority]}
                      </span>
                    )}
                    {item.due_date && (
                      <span className="text-[10px] text-zinc-400">
                        {formatDate(item.due_date)}
                      </span>
                    )}
                    {item.reminder_enabled && (
                      <span className="text-[10px] text-zinc-400">🔔</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="4" y1="7" x2="10" y2="7" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Completed toggle */}
        {completedItems.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5"
            >
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform ${showCompleted ? "rotate-90" : ""}`}
              >
                <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Completed ({completedItems.length})
            </button>

            {showCompleted && (
              <ul className="mt-2">
                {completedItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-2 border-b border-zinc-50 group">
                    <button
                      onClick={() => toggleItem(item.id, item.completed)}
                      className="w-5 h-5 rounded border-2 bg-green-500 border-green-500 flex items-center justify-center flex-shrink-0"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <span className="text-sm text-zinc-400 line-through flex-1">{item.item}</span>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <line x1="4" y1="7" x2="10" y2="7" />
                      </svg>
                    </button>
                  </li>
                ))}
                <li className="mt-2">
                  <button
                    onClick={clearCompleted}
                    className="text-xs text-zinc-400 hover:text-red-500 flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 3h8M4.5 3V2a1 1 0 011-1h1a1 1 0 011 1v1M9.5 3v6a1 1 0 01-1 1h-5a1 1 0 01-1-1V3" />
                    </svg>
                    Clear completed
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}

        {!loading && activeItems.length === 0 && completedItems.length === 0 && (
          <p className="text-center text-zinc-400 text-sm mt-12">Nothing here yet.</p>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-zinc-300 mt-16">
          Message Donna to add items
        </p>
      </div>
    </div>
  );
}
