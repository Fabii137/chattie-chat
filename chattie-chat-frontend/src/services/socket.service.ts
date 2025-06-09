import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subscription } from 'rxjs';
import { Message } from '../entities/message.entity';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('/api', {
      path: '/socket.io'
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });
  }

  joinRoom(roomId: number) {
    this.socket.emit('join-room', roomId);
  }

  sendMessage(roomId: number, senderId: number, message: string) {
    this.socket.emit('send-message', { roomId, senderId, message });
  }

  onMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('receive-message', (message: Message) => {
        observer.next(message);
      });
    });
  }
}
