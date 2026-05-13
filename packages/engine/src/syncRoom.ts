import type { CanvasEvent, Lesson, PresenceState } from "@karasi/types";

export interface RoomSnapshot {
  roomId: string;
  connectedPeers: number;
  activeLesson?: Lesson;
  updatedAt: string;
}

export type Unsubscribe = () => void;

export interface SyncAdapter {
  connect(roomId: string, userId: string): Promise<void>;
  disconnect(): Promise<void>;
  publishSnapshot(snapshot: RoomSnapshot): Promise<void>;
  publishCanvasEvent(event: CanvasEvent): Promise<void>;
  upsertPresence(presence: PresenceState): Promise<void>;
  onSnapshot(listener: (snapshot: RoomSnapshot) => void): Unsubscribe;
  onCanvasEvent(listener: (event: CanvasEvent) => void): Unsubscribe;
  onPresence(listener: (peers: PresenceState[]) => void): Unsubscribe;
}

export class RoomSyncService {
  private currentRoomId: string | null = null;
  private currentUserId: string | null = null;

  constructor(private readonly adapter: SyncAdapter) {}

  async joinRoom(roomId: string, userId: string) {
    this.currentRoomId = roomId;
    this.currentUserId = userId;
    await this.adapter.connect(roomId, userId);
  }

  async leaveRoom() {
    if (this.currentRoomId && this.currentUserId) {
      await this.adapter.upsertPresence({
        roomId: this.currentRoomId,
        userId: this.currentUserId,
        isActive: false,
        lastSeenAt: new Date().toISOString()
      });
    }

    this.currentRoomId = null;
    this.currentUserId = null;
    await this.adapter.disconnect();
  }

  async pushSnapshot(snapshot: RoomSnapshot) {
    await this.adapter.publishSnapshot({
      ...snapshot,
      updatedAt: snapshot.updatedAt || new Date().toISOString()
    });
  }

  async pushCanvasEvent(event: CanvasEvent) {
    await this.adapter.publishCanvasEvent({
      ...event,
      createdAt: event.createdAt || new Date().toISOString()
    });
  }

  async updatePresence(presence: PresenceState) {
    await this.adapter.upsertPresence({
      ...presence,
      lastSeenAt: presence.lastSeenAt || new Date().toISOString()
    });
  }

  onSnapshot(listener: (snapshot: RoomSnapshot) => void): Unsubscribe {
    return this.adapter.onSnapshot(listener);
  }

  onCanvasEvent(listener: (event: CanvasEvent) => void): Unsubscribe {
    return this.adapter.onCanvasEvent(listener);
  }

  onPresence(listener: (peers: PresenceState[]) => void): Unsubscribe {
    return this.adapter.onPresence(listener);
  }
}
