import { io, Socket } from 'socket.io-client';
import { VideoCall } from '../types';

class VideoCallService {
  private socket: Socket | null = null;

  connect(roomId: string) {
    this.socket = io(import.meta.env.VITE_VIDEO_CALL_URL || 'http://localhost:5001');
    
    this.socket.emit('join-room', roomId);
    
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onCallUser(callback: (data: { userId: string; signal: any }) => void) {
    if (this.socket) {
      this.socket.on('call-user', callback);
    }
  }

  onAnswerCall(callback: (data: { signal: any; from: string }) => void) {
    if (this.socket) {
      this.socket.on('answer-call', callback);
    }
  }

  onEndCall(callback: () => void) {
    if (this.socket) {
      this.socket.on('end-call', callback);
    }
  }

  emitCallUser(data: { userId: string; signal: any; roomId: string }) {
    if (this.socket) {
      this.socket.emit('call-user', data);
    }
  }

  emitAnswerCall(data: { signal: any; to: string }) {
    if (this.socket) {
      this.socket.emit('answer-call', data);
    }
  }

  emitEndCall(roomId: string) {
    if (this.socket) {
      this.socket.emit('end-call', { roomId });
    }
  }
}

export const videoCallService = new VideoCallService();