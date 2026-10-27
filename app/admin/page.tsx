"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Background from "@/app/components/Background";
import PrimaryButton from "@/app/components/buttons/PrimaryButton";
import TextInput from "@/app/components/inputs/TextInput";
import { formatCategoryLabel } from "@/app/words";

type Packs = Record<string, string[]>;

async function fetchJson(url: string, init?: RequestInit, timeoutMs = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    return { res, data };
  } finally {
    clearTimeout(timer);
  }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [packs, setPacks] = useState<Packs>({});
  const [selected, setSelected] = useState<string>("");
  const [draftWords, setDraftWords] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [packsLoading, setPacksLoading] = useState(false);

  const categories = useMemo(() => Object.keys(packs).sort(), [packs]);

  const applyPacks = useCallback((next: Packs) => {
    setPacks(next);
    const keys = Object.keys(next).sort();
    setSelected((prev) => {
      if (prev && next[prev]) return prev;
      return keys[0] || "";
    });
  }, []);

  const loadPacks = useCallback(async () => {
    const { res, data } = await fetchJson("/api/admin/words");
    if (res.status === 401) {
      setAuthed(false);
      return false;
    }
    if (!res.ok || !data?.ok) {
      setError(data?.error || `Failed to load packs (${res.status})`);
      setAuthed(false);
      return false;
    }
    applyPacks(data.packs || {});
    setAuthed(true);
    return true;
  }, [applyPacks]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      const sessionP = fetchJson("/api/admin/session", undefined, 8000);
      const packsP = fetchJson("/api/admin/words", undefined, 12000);
      try {
        const { data } = await sessionP;
        if (cancelled) return;
        setConfigured(data?.configured !== false);
        if (!data?.authenticated) {
          setAuthed(false);
          return;
        }
        setAuthed(true);
        setPacksLoading(true);
        setChecking(false);
        try {
          const { res, data: packData } = await packsP;
          if (cancelled) return;
          if (res.status === 401) {
            setAuthed(false);
            return;
          }
          if (!res.ok || !packData?.ok) {
            setError(packData?.error || `Failed to load packs (${res.status})`);
            return;
          }
          applyPacks(packData.packs || {});
        } catch (e: any) {
          if (!cancelled) {
            setError(
              e?.name === "AbortError"
                ? "Timed out loading packs from Firestore."
                : (e?.message || "Failed to load packs")
            );
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setAuthed(false);
          setConfigured(true);
          setError(
            e?.name === "AbortError"
              ? "Timed out reaching admin API. Is the dev server running?"
              : (e?.message || "Could not reach admin API")
          );
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
          setPacksLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyPacks]);

  useEffect(() => {
    if (!selected) {
      setDraftWords("");
      return;
    }
    setDraftWords((packs[selected] || []).join("\n"));
  }, [selected, packs]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { res, data } = await fetchJson("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!data?.ok) {
        setError(data?.error || (res.status === 401 ? "Invalid password" : "Login failed"));
        return;
      }
      setPassword("");
      setConfigured(true);
      await loadPacks();
    } catch (err: any) {
      setError(err?.name === "AbortError" ? "Login timed out" : (err?.message || "Login failed"));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetchJson("/api/admin/logout", { method: "POST" }).catch(() => null);
    setAuthed(false);
    setPacks({});
    setSelected("");
  };

  const saveSelected = async () => {
    if (!selected) return;
    setBusy(true);
    setStatus("");
    setError("");
    try {
      const words = draftWords
        .split(/\r?\n/)
        .map((w) => w.trim())
        .filter(Boolean);
      const { data } = await fetchJson("/api/admin/words", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: selected, words }),
      });
      if (!data?.ok) {
        setError(data?.error || "Save failed");
        return;
      }
      setPacks((prev) => ({ ...prev, [selected]: words }));
      setStatus(`Saved ${selected} (${words.length} words)`);
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = newCategory.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
    if (!cat) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await fetchJson("/api/admin/words", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: cat, words: [] }),
      });
      if (!data?.ok) {
        setError(data?.error || "Could not add category");
        return;
      }
      setPacks((prev) => ({ ...prev, [cat]: [] }));
      setSelected(cat);
      setNewCategory("");
      setStatus(`Created ${cat}`);
    } catch (err: any) {
      setError(err?.message || "Could not add category");
    } finally {
      setBusy(false);
    }
  };

  const deleteSelected = async () => {
    if (!selected) return;
    if (!confirm(`Delete category "${selected}"?`)) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await fetchJson(
        `/api/admin/words?category=${encodeURIComponent(selected)}`,
        { method: "DELETE" }
      );
      if (!data?.ok) {
        setError(data?.error || "Delete failed");
        return;
      }
      const next = { ...packs };
      delete next[selected];
      setPacks(next);
      const keys = Object.keys(next).sort();
      setSelected(keys[0] || "");
      setStatus(`Deleted ${selected}`);
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const seedDefaults = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await fetchJson("/api/admin/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replace: false }),
      });
      if (!data?.ok) {
        setError(data?.error || "Seed failed");
        return;
      }
      setStatus(`Seeded: ${(data.seeded || []).join(", ")}`);
      await loadPacks();
    } catch (err: any) {
      setError(err?.message || "Seed failed");
    } finally {
      setBusy(false);
    }
  };

  if (checking) {
    return (
      <Background>
        <p className="text-center text-[var(--spycy-muted)] py-20">Loading…</p>
      </Background>
    );
  }

  if (!authed) {
    return (
      <Background>
        <div className="flex flex-1 flex-col items-center justify-center py-12">
          <div className="spycy-panel w-full max-w-sm rounded-2xl p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400 mb-2">Spycy admin</p>
            <h1 className="text-2xl font-bold mb-4">Word packs</h1>
            {!configured && (
              <p className="text-amber-300 text-sm mb-3">
                <code className="text-white/90">ADMIN_PASSWORD</code> is not set on the server.
                Add it to <code className="text-white/90">.env.local</code> (and Vercel), then restart.
              </p>
            )}
            <form onSubmit={login} className="flex flex-col gap-3">
              <TextInput
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Admin password"
                autoComplete="current-password"
                disabled={!configured}
              />
              <PrimaryButton
                type="submit"
                text={busy ? "…" : "Enter"}
                disabled={busy || !password || !configured}
                className="w-full"
              />
            </form>
            {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
            <p className="text-xs text-[var(--spycy-muted)] mt-4">
              Server-only env — never use <code className="text-white/80">NEXT_PUBLIC_</code>.
            </p>
          </div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <div className="flex flex-1 flex-col gap-4 py-4 animate-riseIn">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-rose-400">Admin</p>
            <h1 className="text-2xl font-bold">Word packs</h1>
          </div>
          <div className="flex gap-2">
            <PrimaryButton text="Seed defaults" variant="secondary" onClick={seedDefaults} disabled={busy} />
            <PrimaryButton text="Log out" variant="ghost" onClick={logout} />
          </div>
        </div>

        <form onSubmit={addCategory} className="flex gap-2">
          <TextInput
            value={newCategory}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
            placeholder="New category (e.g. food)"
            className="flex-1"
          />
          <PrimaryButton type="submit" text="Add" variant="secondary" disabled={busy || !newCategory.trim()} />
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-4 flex-1 min-h-0">
          <div className="spycy-panel rounded-xl p-2 flex flex-col gap-1 max-h-[50vh] sm:max-h-none overflow-y-auto">
            {packsLoading && (
              <p className="text-sm text-[var(--spycy-muted)] p-2">Loading packs…</p>
            )}
            {!packsLoading && categories.length === 0 && (
              <p className="text-sm text-[var(--spycy-muted)] p-2">No packs yet. Seed defaults.</p>
            )}
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelected(cat)}
                className={`text-left rounded-lg px-3 py-2 text-sm transition ${
                  selected === cat ? "bg-rose-500/20 border border-rose-400/40" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="font-semibold block">{formatCategoryLabel(cat)}</span>
                <span className="text-xs text-[var(--spycy-muted)]">{(packs[cat] || []).length} words</span>
              </button>
            ))}
          </div>

          <div className="spycy-panel rounded-xl p-4 flex flex-col gap-3">
            {selected ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-xl font-bold">{formatCategoryLabel(selected)}</h2>
                  <button
                    type="button"
                    onClick={deleteSelected}
                    className="text-xs text-rose-300 border border-rose-500/30 rounded-lg px-2 py-1 hover:bg-rose-500/10"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-[var(--spycy-muted)]">One word per line</p>
                <textarea
                  value={draftWords}
                  onChange={(e) => setDraftWords(e.target.value)}
                  className="flex-1 min-h-[240px] w-full rounded-xl border border-white/15 bg-[var(--spycy-ink)] p-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50 font-mono"
                  spellCheck={false}
                />
                <PrimaryButton text={busy ? "Saving…" : "Save category"} onClick={saveSelected} disabled={busy} className="w-full" />
              </>
            ) : (
              <p className="text-[var(--spycy-muted)] py-8 text-center">Select or create a category</p>
            )}
          </div>
        </div>

        {status && <p className="text-cyan-300 text-sm text-center">{status}</p>}
        {error && <p className="text-rose-400 text-sm text-center">{error}</p>}
        <a href="/" className="text-center text-sm text-[var(--spycy-muted)] underline">
          ← Back to game
        </a>
      </div>
    </Background>
  );
}
