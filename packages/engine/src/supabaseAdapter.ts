import type { CanvasEvent, PresenceState } from "@karasi/types";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient
} from "@supabase/supabase-js";

import type { RoomSnapshot, SyncAdapter, Unsubscribe } from "./syncRoom";

interface SnapshotRow {
  room_id: string;
  connected_peers: number;
  active_lesson: unknown | null;
  updated_at: string;
}

interface CanvasEventRow {
  event_id: string;
  room_id: string;
  user_id: string | null;
  sequence: number;
  event_type: "stroke" | "text" | "clear";
  event_data: CanvasEvent["payload"];
  created_at: string;
}

interface PresenceRow {
  room_id: string;
  user_id: string;
  display_name: string | null;
  color: string | null;
  is_active: boolean;
  last_seen_at: string;
}

interface SupabaseSyncAdapterOptions {
  ignoreSelfEvents?: boolean;
}

export class SupabaseSyncAdapter implements SyncAdapter {
  private roomId: string | null = null;
  private userId: string | null = null;
  private channels: RealtimeChannel[] = [];
  private readonly snapshotListeners = new Set<(snapshot: RoomSnapshot) => void>();
  private readonly canvasEventListeners = new Set<(event: CanvasEvent) => void>();
  private readonly presenceListeners = new Set<(peers: PresenceState[]) => void>();

  constructor(
    private readonly client: SupabaseClient,
    private readonly options: SupabaseSyncAdapterOptions = {}
  ) {}

  async connect(roomId: string, userId: string): Promise<void> {
    await this.disconnect();

    this.roomId = roomId;
    this.userId = userId;

    const canvasChannel = this.client
      .channel(`desk-canvas:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "canvas_events",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const event = this.mapCanvasEvent(payload);
          if (!event) {
            return;
          }

          if (this.options.ignoreSelfEvents && event.userId === this.userId) {
            return;
          }

          for (const listener of this.canvasEventListeners) {
            listener(event);
          }
        }
      )
      .subscribe();

    const snapshotChannel = this.client
      .channel(`desk-snapshot:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_snapshots",
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const snapshot = this.mapSnapshot(payload);
          if (!snapshot) {
            return;
          }

          for (const listener of this.snapshotListeners) {
            listener(snapshot);
          }
        }
      )
      .subscribe();

    const presenceChannel = this.client
      .channel(`desk-presence:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_presence",
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          await this.refreshPresence();
        }
      )
      .subscribe();

    this.channels.push(canvasChannel, snapshotChannel, presenceChannel);

    await this.upsertPresence({
      roomId,
      userId,
      isActive: true,
      lastSeenAt: new Date().toISOString()
    });

    await this.refreshPresence();
  }

  async disconnect(): Promise<void> {
    for (const channel of this.channels) {
      await this.client.removeChannel(channel);
    }

    this.channels = [];
    this.roomId = null;
    this.userId = null;
  }

  async publishSnapshot(snapshot: RoomSnapshot): Promise<void> {
    const { error } = await this.client.from("room_snapshots").upsert(
      {
        room_id: snapshot.roomId,
        connected_peers: snapshot.connectedPeers,
        active_lesson: snapshot.activeLesson ?? null,
        updated_at: snapshot.updatedAt
      },
      { onConflict: "room_id" }
    );

    if (error) {
      throw new Error(`Failed to publish room snapshot: ${error.message}`);
    }
  }

  async publishCanvasEvent(event: CanvasEvent): Promise<void> {
    const { error } = await this.client.from("canvas_events").insert({
      event_id: event.eventId,
      room_id: event.roomId,
      user_id: event.userId,
      sequence: event.sequence,
      event_type: event.type,
      event_data: event.payload,
      created_at: event.createdAt
    });

    if (error) {
      throw new Error(`Failed to publish canvas event: ${error.message}`);
    }
  }

  async upsertPresence(presence: PresenceState): Promise<void> {
    const { error } = await this.client.from("room_presence").upsert(
      {
        room_id: presence.roomId,
        user_id: presence.userId,
        display_name: presence.displayName ?? null,
        color: presence.color ?? null,
        is_active: presence.isActive,
        last_seen_at: presence.lastSeenAt
      },
      { onConflict: "room_id,user_id" }
    );

    if (error) {
      throw new Error(`Failed to upsert room presence: ${error.message}`);
    }
  }

  onSnapshot(listener: (snapshot: RoomSnapshot) => void): Unsubscribe {
    this.snapshotListeners.add(listener);
    return () => {
      this.snapshotListeners.delete(listener);
    };
  }

  onCanvasEvent(listener: (event: CanvasEvent) => void): Unsubscribe {
    this.canvasEventListeners.add(listener);
    return () => {
      this.canvasEventListeners.delete(listener);
    };
  }

  onPresence(listener: (peers: PresenceState[]) => void): Unsubscribe {
    this.presenceListeners.add(listener);
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  private mapSnapshot(
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ): RoomSnapshot | null {
    const row = payload.new as Partial<SnapshotRow> | null;
    if (!row || !row.room_id || !row.updated_at) {
      return null;
    }

    return {
      roomId: row.room_id,
      connectedPeers: row.connected_peers ?? 0,
      activeLesson: (row.active_lesson as RoomSnapshot["activeLesson"] | null) ?? undefined,
      updatedAt: row.updated_at
    };
  }

  private mapCanvasEvent(
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ): CanvasEvent | null {
    const row = payload.new as Partial<CanvasEventRow> | null;
    if (!row || !row.event_id || !row.room_id || !row.event_type || !row.created_at) {
      return null;
    }

    return {
      eventId: row.event_id,
      roomId: row.room_id,
      userId: row.user_id ?? "unknown",
      sequence: row.sequence ?? 0,
      type: row.event_type,
      payload: (row.event_data as CanvasEvent["payload"]) ?? { reason: "empty-payload" },
      createdAt: row.created_at
    };
  }

  private async refreshPresence(): Promise<void> {
    if (!this.roomId) {
      return;
    }

    const { data, error } = await this.client
      .from("room_presence")
      .select("room_id, user_id, display_name, color, is_active, last_seen_at")
      .eq("room_id", this.roomId)
      .eq("is_active", true)
      .order("last_seen_at", { ascending: false });

    if (error || !data) {
      return;
    }

    const peers = data.map((row) => this.mapPresenceRow(row as PresenceRow));
    for (const listener of this.presenceListeners) {
      listener(peers);
    }
  }

  private mapPresenceRow(row: PresenceRow): PresenceState {
    return {
      roomId: row.room_id,
      userId: row.user_id,
      displayName: row.display_name ?? undefined,
      color: row.color ?? undefined,
      isActive: row.is_active,
      lastSeenAt: row.last_seen_at
    };
  }
}
