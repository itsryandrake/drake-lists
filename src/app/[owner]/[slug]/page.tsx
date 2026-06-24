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

const LIST_LABELS: Record<string, { label: string; icon: string }> = {
  shopping: { label: "Shopping + Grocery", icon: "🛒" },
  errands: { label: "Errands / Out and About", icon: "🚶" },
  home: { label: "Home / Property", icon: "🏠" },
  "online-orders": { label: "Online / Orders", icon: "📦" },
  admin: { label: "Admin", icon: "📋" },
  later: { label: "Low-pressure / Later", icon: "🌱" },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low: "bg-zinc-50 text-zinc-400 border-zinc-200",
};

const PRIORITY_LABELS: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff < 0) return `Overdue — ${Math.abs(Math.round(diff))}d ago`;
  if (diff <= 7) return `Due in ${Math.round(diff)}d`;
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
  const accentColor = owner === "ryan" ? "amber" : "rose";
  const accentBg = owner === "ryan" ? "bg-amber-500" : "bg-rose-400";
  const accentText = owner === "ryan" ? "text-amber-600" : "text-rose-500";
  const accentHover = owner === "ryan" ? "hover:bg-amber-50/50" : "hover:bg-rose-50/50";
  const listInfo = LIST_LABELS[slug] || { label: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), icon: "📝" };

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

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const addItem = async () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: trimmed, added_by: "web", owner, list_slug: slug,
          priority: priority || undefined, due_date: dueDate || undefined, reminder_enabled: reminder,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const added = await res.json();
      setItems((prev) => [added, ...prev]);
      setNewItem(""); setPriority(null); setDueDate(""); setReminder(false); setShowForm(false);
    } catch (e) { console.error(e); }
  };

  const toggleItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !item.completed } : i)));
    await fetch("/api/items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !item.completed }),
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
    for (const id of ids) await fetch(`/api/items?id=${id}`, { method: "DELETE" });
  };

  const activeItems = items.filter((i) => !i.completed);
  const completedItems = items.filter((i) => i.completed);
  const completedCount = completedItems.length;
  const totalCount = items.length;

  return (
    <div className="min-h-screen glass-bg bg-zinc-50 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl animate-blob ${owner === "ryan" ? "bg-amber-200/15" : "bg-rose-200/15"}`} />
      <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl animate-blob-slow bg-zinc-200/10" />

      <div className="relative z-10 mx-auto max-w-lg px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 group">
            <Image src="/crest.png" alt="Drake" width={28} height={28} className="rounded opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="text-sm font-semibold text-zinc-400 group-hover:text-zinc-600 transition-colors uppercase tracking-wider">Drake</span>
          </button>
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${owner === "ryan" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
            {ownerName}
          </span>
        </div>

        {/* List title card */}
        <div className="glass-strong rounded-2xl p-5 mb-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{listInfo.icon}</span>
            <div>
              <h1 className="text-xl font-serif font-bold text-zinc-800">{listInfo.label}</h1>
              <p className="text-xs text-zinc-400 mt-0.5">{ownerName}&apos;s list</p>
            </div>
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${accentBg}`}
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-zinc-400 tabular-nums font-medium">{completedCount}/{totalCount}</span>
            </div>
          )}
        </div>

        {/* Add item */}
        <div className="mb-5">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 glass rounded-xl text-zinc-400 hover:text-zinc-600 transition-all text-sm font-medium border-dashed"
            >
              + Add item
            </button>
          ) : (
            <div className="glass-strong rounded-2xl p-4 space-y-3">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="What needs doing?"
                className="w-full bg-transparent py-1 text-sm placeholder-zinc-400 text-zinc-800 focus:outline-none"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") addItem(); if (e.key === "Escape") setShowForm(false); }}
              />
              <div className="flex gap-2 flex-wrap items-center">
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">Priority</label>
                  <select
                    value={priority || ""}
                    onChange={(e) => setPriority(e.target.value || null)}
                    className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-zinc-600"
                  >
                    <option value="">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">Due date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-zinc-600"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-zinc-500 cursor-pointer">
                  <input type="checkbox" checked={reminder} onChange={(e) => setReminder(e.target.checked)} className="rounded" />
                  Remind
                </label>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={addItem} disabled={!newItem.trim()}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all ${accentBg} hover:opacity-90 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed`}
                >Add</button>
                <button onClick={() => setShowForm(false)} className="px-4 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-600">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Items */}
        {loading ? (
          <div className="text-center py-12 text-zinc-400 text-sm">Loading...</div>
        ) : (
          <>
            <div className="glass rounded-2xl overflow-hidden">
              {activeItems.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-sm">Nothing here yet.</div>
              ) : (
                <ul>
                  {activeItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100/50 last:border-b-0 group transition-colors hover:bg-white/30">
                      <button onClick={() => toggleItem(item.id)}
                        className="w-5 h-5 rounded-full border-2 border-zinc-300 flex items-center justify-center flex-shrink-0 hover:border-zinc-400 transition-colors"
                      >
                        {item.completed && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-zinc-800 block truncate">{item.item}</span>
                        <div className="flex gap-2 mt-0.5 flex-wrap">
                          {item.priority && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${PRIORITY_COLORS[item.priority]}`}>
                              {PRIORITY_LABELS[item.priority]}
                            </span>
                          )}
                          {item.due_date && (
                            <span className={`text-[10px] ${item.due_date < new Date().toISOString().split("T")[0] && !item.completed ? "text-red-500 font-medium" : "text-zinc-400"}`}>
                              {formatDate(item.due_date)}
                            </span>
                          )}
                          {item.reminder_enabled && (
                            <span className="text-[10px] text-zinc-400">🔔</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteItem(item.id)}
                        className="text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="4" y1="7" x2="10" y2="7" strokeLinecap="round"/></svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Completed */}
            {completedItems.length > 0 && (
              <div className="mt-4">
                <button onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 font-medium"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className={`transition-transform ${showCompleted ? "rotate-90" : ""}`}>
                    <path d="M3.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Completed ({completedItems.length})
                </button>
                {showCompleted && (
                  <div className="glass rounded-2xl mt-2 overflow-hidden">
                    <ul>
                      {completedItems.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-zinc-100/50 last:border-b-0 group">
                          <button onClick={() => toggleItem(item.id)}
                            className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                          <span className="text-sm text-zinc-400 line-through flex-1">{item.item}</span>
                          <button onClick={() => deleteItem(item.id)} className="text-zinc-300 hover:text-red-400 opacity-0 group-hover:opacity-100">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="6" x2="9" y2="6" strokeLinecap="round"/></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button onClick={clearCompleted} className="w-full py-2 text-[11px] text-zinc-400 hover:text-red-500 font-medium transition-colors">
                      Clear completed
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <p className="text-center text-[11px] text-zinc-300 mt-12">Message Donna to add items</p>
      </div>
    </div>
  );
}
