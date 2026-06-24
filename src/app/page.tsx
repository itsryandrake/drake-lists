"use client";

import { useState, useEffect, useCallback } from "react";

interface ListItem {
  id: string;
  item: string;
  completed: boolean;
  added_by: string;
  list_name: string;
  created_at: string;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning!";
  if (hour < 17) return "Good afternoon!";
  return "Good evening!";
}

export default function Home() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/items");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load list");
    } finally {
      setLoading(false);
    }
  }, []);

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
        body: JSON.stringify({ item: trimmed, added_by: "donna" }),
      });
      if (!res.ok) throw new Error("Failed to add");
      const added = await res.json();
      setItems((prev) => [...prev, added]);
      setNewItem("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add item");
    }
  };

  const toggleItem = async (id: string, completed: boolean) => {
    // Optimistic
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, completed: !completed } : i))
    );
    try {
      await fetch("/api/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed: !completed }),
      });
    } catch {
      fetchItems(); // rollback
    }
  };

  const clearCompleted = async () => {
    const completedIds = items.filter((i) => i.completed).map((i) => i.id);
    if (!completedIds.length) return;
    setItems((prev) => prev.filter((i) => !i.completed));
    for (const id of completedIds) {
      await fetch(`/api/items?id=${id}`, { method: "DELETE" });
    }
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const listName = items[0]?.list_name || "Shared Shopping + Grocery";

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="mx-auto max-w-md px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-serif font-bold tracking-tight text-black">
            ollie
          </h1>
          <button className="text-zinc-400 hover:text-zinc-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Greeting */}
        <p className="text-3xl font-serif font-bold text-black mt-8">
          {getGreeting()}
        </p>
        <p className="text-zinc-500 text-base mt-1">Here&apos;s your list.</p>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-400 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-sm text-zinc-400 tabular-nums">
              {completedCount} / {totalCount}
            </span>
          </div>
        )}

        {/* Add button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addItem();
          }}
          className="mt-6"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add an item..."
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 text-base placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
            >
              + Add
            </button>
          </div>
        </form>

        {/* List name */}
        <h2 className="text-lg font-bold text-black mt-8 mb-1">{listName}</h2>

        {/* Loading / Error */}
        {loading && (
          <p className="text-zinc-400 text-sm mt-4">Loading your list...</p>
        )}
        {error && !loading && (
          <p className="text-red-500 text-sm mt-4">{error}</p>
        )}

        {/* List items */}
        {!loading && !error && (
          <ul className="mt-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 py-3 border-b border-zinc-50 group"
              >
                <button
                  onClick={() => toggleItem(item.id, item.completed)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    item.completed
                      ? "bg-orange-400 border-orange-400"
                      : "border-zinc-300 hover:border-orange-400"
                  }`}
                >
                  {item.completed && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-base flex-1 ${
                    item.completed
                      ? "line-through text-zinc-400"
                      : "text-zinc-800"
                  }`}
                >
                  {item.item}
                </span>
                <button
                  onClick={async () => {
                    await fetch(`/api/items?id=${item.id}`, { method: "DELETE" });
                    setItems((prev) => prev.filter((i) => i.id !== item.id));
                  }}
                  className="text-zinc-300 hover:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="6" cy="6" r="1.5" />
                    <circle cx="10" cy="6" r="1.5" />
                    <circle cx="6" cy="10" r="1.5" />
                    <circle cx="10" cy="10" r="1.5" />
                  </svg>
                </button>
              </li>
            ))}
            {items.length === 0 && !loading && (
              <li className="py-8 text-center text-zinc-400 text-sm">
                Nothing here yet. Add your first item above.
              </li>
            )}
          </ul>
        )}

        {/* Clear completed */}
        {completedCount > 0 && (
          <button
            onClick={clearCompleted}
            className="mt-4 text-sm text-zinc-400 hover:text-zinc-600 flex items-center gap-1.5 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4h10M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M11 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1V4" />
            </svg>
            Clear completed
          </button>
        )}

        {/* Tip */}
        <p className="mt-12 text-xs text-zinc-300 text-center">
          Tip: message Donna to add items to this list
        </p>
      </div>
    </div>
  );
}
