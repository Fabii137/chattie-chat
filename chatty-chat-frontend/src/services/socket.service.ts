import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
  }

  joinRoom(roomId: string) {
    this.socket.emit('join-room', roomId);
  }

  sendMessage(roomId: string, message: any) {
    this.socket.emit('send-message', { roomId, message });
  }

  onMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receive-message', (message) => {
        observer.next(message);
      });
    });
  }
}
