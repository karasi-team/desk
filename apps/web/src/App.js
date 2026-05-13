import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { RoomSyncService, SupabaseSyncAdapter } from "@karasi/engine";
import { StudioButton, StudioCard } from "@karasi/ui";
import { createClient } from "@supabase/supabase-js";
const sampleLessons = [
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
function buildDeskPath(roomId) {
    return `/desk/${encodeURIComponent(roomId)}`;
}
function LandingPage({ onLaunch }) {
    return (_jsx("main", { className: "min-h-screen bg-surface px-6 py-10 text-ink sm:px-10", children: _jsxs("section", { className: "mx-auto max-w-5xl space-y-8", children: [_jsxs("header", { className: "space-y-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.3em] text-emerald-700", children: "Karasi Desk" }), _jsx("h1", { className: "font-display text-4xl leading-tight text-emerald-950 sm:text-5xl", children: "Studio-grade learning, on one collaborative desk." }), _jsx("p", { className: "max-w-2xl text-base text-emerald-900/80 sm:text-lg", children: "Shared canvas, real-time calling, and subject modules designed for focused, high-fidelity instruction." }), _jsxs("div", { className: "flex flex-wrap gap-3", children: [_jsx(StudioButton, { onClick: () => onLaunch("demo-room"), children: "Launch Live Room" }), _jsx(StudioButton, { variant: "secondary", children: "Explore Modules" })] })] }), _jsx("section", { className: "grid gap-4 sm:grid-cols-3", children: sampleLessons.map((lesson) => (_jsxs(StudioCard, { title: lesson.title, subject: lesson.subject, children: [_jsx("p", { className: "text-sm text-emerald-900/80", children: lesson.objective }), _jsxs("p", { className: "mt-3 text-xs uppercase tracking-[0.2em] text-coral-700", children: [lesson.durationMinutes, " minutes"] })] }, lesson.id))) })] }) }));
}
function deriveRoomUUID(roomName) {
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
function DeskRoom({ roomId: roomName, onBack }) {
    const [connected, setConnected] = useState(false);
    const [events, setEvents] = useState([]);
    const [peers, setPeers] = useState([]);
    const [error, setError] = useState(null);
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
        const client = createClient(supabaseUrl, supabaseAnonKey);
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
        const pushPresence = async (isActive) => {
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
                    await client.from("rooms").upsert({ id: roomId, name: roomName, status: "active" }, { onConflict: "id" });
                }
                await service.joinRoom(roomId, userId);
                await pushPresence(true);
                if (isMounted) {
                    setConnected(true);
                    setError(null);
                }
            }
            catch (connectError) {
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
    const publishEvent = async (type, payload) => {
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
        }
        catch (sendError) {
            const message = sendError instanceof Error ? sendError.message : "Failed to send clear";
            setError(message);
        }
    };
    const sendText = async () => {
        const annotation = {
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
        }
        catch (sendError) {
            const message = sendError instanceof Error ? sendError.message : "Failed to send text";
            setError(message);
        }
    };
    return (_jsx("main", { className: "desk-shell min-h-screen px-6 py-8 text-ink sm:px-10", children: _jsxs("section", { className: "mx-auto max-w-5xl space-y-6", children: [_jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-studio backdrop-blur-sm", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-emerald-700", children: "Realtime Desk Smoke Check" }), _jsxs("h1", { className: "font-display text-2xl text-emerald-950", children: ["Room ", roomName] }), _jsxs("p", { className: "text-sm text-emerald-900/80", children: [connected ? "Connected" : "Connecting...", " as ", userId.slice(0, 8)] })] }), _jsx(StudioButton, { variant: "secondary", onClick: onBack, children: "Back to Landing" })] }), !hasSupabaseConfig ? (_jsx("div", { className: "rounded-2xl border border-coral-200 bg-coral-50 p-4 text-coral-900", children: "Missing Vite env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run realtime." })) : null, error ? _jsx("div", { className: "rounded-2xl border border-coral-200 bg-coral-50 p-4 text-coral-900", children: error }) : null, _jsxs("section", { className: "grid gap-4 md:grid-cols-[1.2fr_0.8fr]", children: [_jsxs("article", { className: "rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-studio backdrop-blur-sm", children: [_jsx("h2", { className: "font-display text-xl text-emerald-950", children: "Broadcast Test Events" }), _jsx("p", { className: "mt-2 text-sm text-emerald-900/80", children: "Open this room in two tabs. Trigger events in one tab and confirm they appear in the other." }), _jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-3", children: [_jsxs("label", { className: "text-sm text-emerald-900", children: ["Color", _jsx("input", { className: "ml-2 h-9 w-12 cursor-pointer rounded border border-emerald-200 bg-white", type: "color", value: color, onChange: (event) => setColor(event.target.value) })] }), _jsx("input", { className: "min-w-[220px] flex-1 rounded-full border border-emerald-200 px-4 py-2 text-sm", value: text, onChange: (event) => setText(event.target.value), placeholder: "Text annotation payload" }), _jsx(StudioButton, { onClick: () => void sendText(), children: "Send Text Event" }), _jsx(StudioButton, { variant: "secondary", onClick: () => void sendClear(), children: "Send Clear Event" })] }), _jsx("div", { className: "mt-5 space-y-2", children: events.length === 0 ? (_jsx("p", { className: "text-sm text-emerald-900/60", children: "No remote events yet." })) : (events.map((event) => (_jsxs("div", { className: "rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-sm text-emerald-950", children: [_jsx("strong", { children: event.type }), " from ", event.userId.slice(0, 8), " at ", new Date(event.createdAt).toLocaleTimeString()] }, event.eventId)))) })] }), _jsxs("aside", { className: "rounded-2xl border border-emerald-100 bg-white/85 p-4 shadow-studio backdrop-blur-sm", children: [_jsx("h2", { className: "font-display text-xl text-emerald-950", children: "Presence" }), _jsxs("p", { className: "mt-1 text-sm text-emerald-900/80", children: [peers.length, " active participant(s)"] }), _jsx("div", { className: "mt-4 space-y-2", children: peers.length === 0 ? (_jsx("p", { className: "text-sm text-emerald-900/60", children: "No active peers reported yet." })) : (peers.map((peer) => (_jsxs("div", { className: "flex items-center justify-between rounded-xl border border-emerald-100 px-3 py-2", children: [_jsx("span", { className: "text-sm text-emerald-950", children: peer.displayName ?? peer.userId.slice(0, 8) }), _jsx("span", { className: "text-xs text-emerald-700", children: new Date(peer.lastSeenAt).toLocaleTimeString() })] }, peer.userId)))) })] })] })] }) }));
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
    const navigate = (nextPath) => {
        window.history.pushState({}, "", nextPath);
        setPath(nextPath);
    };
    if (path.startsWith("/desk/")) {
        const segments = path.split("/").filter(Boolean);
        const roomId = decodeURIComponent(segments[1] ?? "demo-room");
        return _jsx(DeskRoom, { roomId: roomId, onBack: () => navigate("/") });
    }
    return _jsx(LandingPage, { onLaunch: (roomId) => navigate(buildDeskPath(roomId)) });
}
