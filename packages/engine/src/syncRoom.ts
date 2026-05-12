import type { Lesson } from "@karasi/types";

export interface RoomSnapshot {
  roomId: string;
  connectedPeers: number;
  activeLesson?: Lesson;
  updatedAt: string;
}

export interface SyncAdapter {
  connect(roomId: string): Promise<void>;
  disconnect(): Promise<void>;
  publishSnapshot(snapshot: RoomSnapshot): Promise<void>;
}

export class RoomSyncService {
  constructor(private readonly adapter: SyncAdapter) {}

  async joinRoom(roomId: string) {
    await this.adapter.connect(roomId);
  }

  async leaveRoom() {
    await this.adapter.disconnect();
  }

  async pushSnapshot(snapshot: RoomSnapshot) {
    await this.adapter.publishSnapshot({
      ...snapshot,
      updatedAt: snapshot.updatedAt || new Date().toISOString()
    });
  }
}
