import { useEffect, useMemo, useRef, useState } from "react";
import { RoomSyncService, SupabaseSyncAdapter } from "@karasi/engine";
import { StudioButton, StudioCard } from "@karasi/ui";
import type { CanvasEvent, Lesson, PresenceState, TextAnnotation } from "@karasi/types";
import { createClient } from "@supabase/supabase-js";

const sampleLessons: Lesson[] = [
  {
    id: "eng-01",
    subject: "english",
    title: "Narrative Structure Lab",
    objective: "Analyze character motivation and argument flow.",
    durationMinutes: 40
  },
  {
    id: "math-01",
    subject: "math",
    title: "Function Transform Studio",
    objective: "Map graph transformations collaboratively.",
    durationMinutes: 35
  },
  {
    id: "law-01",
    subject: "law",
    title: "Case Reasoning Workshop",
    objective: "Debate precedent and statutory interpretation.",
    durationMinutes: 45
  }
];

function getOrCreateUserId() {
  const storageKey = "karasi-desk-user-id";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const generated = crypto.randomUUID();
  window.localStorage.setItem(storageKey, generated);
  return generated;
}

function buildDeskPath(roomId: string) {
  return `/desk/${encodeURIComponent(roomId)}`;
}

function LandingPage({ onLaunch }: { onLaunch: (roomId: string) => void }) {
  return (
    <main className="min-h-screen bg-surface px-6 py-10 text-ink sm:px-10">
      <section className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Karasi Desk</p>
          <h1 className="font-display text-4xl leading-tight text-emerald-950 sm:text-5xl">
            Studio-grade learning, on one collaborative desk.
          </h1>
          <p className="max-w-2xl text-base text-emerald-900/80 sm:text-lg">
            Shared canvas, real-time calling, and subject modules designed for focused, high-fidelity
            instruction.
          </p>
          <div className="flex flex-wrap gap-3">
            <StudioButton onClick={() => onLaunch("demo-room")}>Launch Live Room</StudioButton>
            <StudioButton variant="secondary">Explore Modules</StudioButton>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {sampleLessons.map((lesson) => (
            <StudioCard key={lesson.id} title={lesson.title} subject={lesson.subject}>
              <p className="text-sm text-emerald-900/80">{lesson.objective}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-coral-700">
                {lesson.durationMinutes} minutes
              </p>
            </StudioCard>
          ))}
        </section>
      </section>
    </main>
  );
}

function deriveRoomUUID(roomName: string): string {
  const chars = roomName.split("").map((c) => c.charCodeAt(0));
  const hash = chars
    .reduce((a, b) => {
      a = (a << 5) - a + b;
      return a & a;
    }, 0)
    .toString(16)
    .padStart(8, "0");
  return `${hash}0000-0000-5000-a000-000000000000`;
}

function DeskRoom({ roomId: roomName, onBack }: { roomId: string; onBack: () => void }) {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<CanvasEvent[]>([]);
  const [peers, setPeers] = useState<PresenceState[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [color, setColor] = useState("#0f8a70");
  const [text, setText] = useState("Quick note");

  const sequenceRef = useRef(0);
  const userId = useMemo(() => getOrCreateUserId(), []);
  const roomId = useMemo(() => deriveRoomUUID(roomName), [roomName]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

  const service = useMemo(() => {
    if (!hasSupabaseConfig) {
      return null;
    }

    const client = createClient(supabaseUrl as string, supabaseAnonKey as string);
    const adapter = new SupabaseSyncAdapter(client, { ignoreSelfEvents: true });
    return new RoomSyncService(adapter);
  }, [hasSupabaseConfig, supabaseAnonKey, supabaseUrl]);

  useEffect(() => {
    if (!service) {
      return;
    }

    let isMounted = true;
    const unlistenEvent = service.onCanvasEvent((event) => {
      setEvents((current) => [event, ...current].slice(0, 25));
    });
    const unlistenPresence = service.onPresence((nextPeers) => {
      setPeers(nextPeers);
    });
    const unlistenSnapshot = service.onSnapshot(() => {
      // Snapshot feed is wired for phase-2 verification; UI rendering will follow in canvas phase.
    });

    const pushPresence = async (isActive: boolean) => {
      await service.updatePresence({
        roomId,
        userId,
        displayName: `User ${userId.slice(0, 4)}`,
        color,
        isActive,
        lastSeenAt: new Date().toISOString()
      });
    };

    const connect = async () => {
      try {
        if (service && supabaseUrl && supabaseAnonKey) {
          const client = createClient(supabaseUrl, supabaseAnonKey);
          await client.from("rooms").upsert(
            { id: roomId, name: roomName, status: "active" },
            { onConflict: "id" }
          );
        }

        await service.joinRoom(roomId, userId);
        await pushPresence(true);

        if (isMounted) {
          setConnected(true);
          setError(null);
        }
      } catch (connectError) {
        if (isMounted) {
          const message = connectError instanceof Error ? connectError.message : "Failed to connect";
          setError(message);
          setConnected(false);
        }
      }
    };

    void connect();
    const heartbeat = window.setInterval(() => {
      void pushPresence(true);
    }, 15000);

    return () => {
      isMounted = false;
      window.clearInterval(heartbeat);
      unlistenEvent();
      unlistenPresence();
      unlistenSnapshot();
      void service.leaveRoom();
    };
  }, [color, roomId, service, userId]);

  const publishEvent = async (type: CanvasEvent["type"], payload: CanvasEvent["payload"]) => {
    if (!service) {
      return;
    }

    sequenceRef.current += 1;
    await service.pushCanvasEvent({
      eventId: crypto.randomUUID(),
      roomId,
      userId,
      sequence: sequenceRef.current,
      type,
      payload,
      createdAt: new Date().toISOString()
    });
  };

  const sendClear = async () => {
    try {
      await publishEvent("clear", { reason: "manual-clear" });
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Failed to send clear";
      setError(message);
    }
  };

  const sendText = async () => {
    const annotation: TextAnnotation = {
      id: crypto.randomUUID(),
      roomId,
      userId,
      color,
      position: { x: 120, y: 80 },
      text,
      createdAt: new Date().toISOString()
    };

    try {
      await publishEvent("text", annotation);
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Failed to send text";
      setError(message);
    }
  };

  return (
    <main className="desk-shell min-h-screen px-6 py-8 text-ink sm:px-10">
      <section className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-studio backdrop-blur-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-700">Realtime Desk Smoke Check</p>
            <h1 className="font-display text-2xl text-emerald-950">Room {roomName}</h1>
            <p className="text-sm text-emerald-900/80">
              {connected ? "Connected" : "Connecting..."} as {userId.slice(0, 8)}
            </p>
          </div>
          <StudioButton variant="secondary" onClick={onBack}>
            Back to Landing
          </StudioButton>
        </header>

        {!hasSupabaseConfig ? (
          <div className="rounded-2xl border border-coral-200 bg-coral-50 p-4 text-coral-900">
            Missing Vite env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run realtime.
          </div>
        ) : null}

        {error ? <div className="rounded-2xl border border-coral-200 bg-coral-50 p-4 text-coral-900">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-studio backdrop-blur-sm">
            <h2 className="font-display text-xl text-emerald-950">Broadcast Test Events</h2>
            <p className="mt-2 text-sm text-emerald-900/80">
              Open this room in two tabs. Trigger events in one tab and confirm they appear in the other.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="text-sm text-emerald-900">
                Color
                <input
                  className="ml-2 h-9 w-12 cursor-pointer rounded border border-emerald-200 bg-white"
                  type="color"
                  value={color}
                  onChange={(event) => setColor(event.target.value)}
                />
              </label>
              <input
                className="min-w-[220px] flex-1 rounded-full border border-emerald-200 px-4 py-2 text-sm"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Text annotation payload"
              />
              <StudioButton onClick={() => void sendText()}>Send Text Event</StudioButton>
              <StudioButton variant="secondary" onClick={() => void sendClear()}>
                Send Clear Event
              </StudioButton>
            </div>

            <div className="mt-5 space-y-2">
              {events.length === 0 ? (
                <p className="text-sm text-emerald-900/60">No remote events yet.</p>
              ) : (
                events.map((event) => (
                  <div
                    className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-950"
                    key={event.eventId}
                  >
                    <strong>{event.type}</strong> from {event.userId.slice(0, 8)} at {new Date(event.createdAt).toLocaleTimeString()}
                  </div>
                ))
              )}
            </div>
          </article>

          <aside className="rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-studio backdrop-blur-sm">
            <h2 className="font-display text-xl text-emerald-950">Presence</h2>
            <p className="mt-1 text-sm text-emerald-900/80">{peers.length} active participant(s)</p>
            <div className="mt-4 space-y-2">
              {peers.length === 0 ? (
                <p className="text-sm text-emerald-900/60">No active peers reported yet.</p>
              ) : (
                peers.map((peer) => (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-100 px-3 py-2" key={peer.userId}>
                    <span className="text-sm text-emerald-950">{peer.displayName ?? peer.userId.slice(0, 8)}</span>
                    <span className="text-xs text-emerald-700">{new Date(peer.lastSeenAt).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const navigate = (nextPath: string) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  if (path.startsWith("/desk/")) {
    const segments = path.split("/").filter(Boolean);
    const roomId = decodeURIComponent(segments[1] ?? "demo-room");
    return <DeskRoom roomId={roomId} onBack={() => navigate("/")} />;
  }

  return <LandingPage onLaunch={(roomId) => navigate(buildDeskPath(roomId))} />;
}
