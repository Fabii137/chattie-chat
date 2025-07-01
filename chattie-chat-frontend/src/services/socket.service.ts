import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Message } from '../entities/message.entity';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  constructor() { }

  connect() {
    this.socket = io('/', {
      path: environment.socketURL,
      withCredentials: true
    });

    this.socket.on('connect', () => {
      if(!environment.production)
        console.log('Socket connected:', this.socket?.id);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }


  joinRoom(roomId: number) {
    this.connect();
    this.socket?.emit('join-room', roomId);
  }

  sendMessage(roomId: number, message: string) {
    this.socket?.emit('send-message', { roomId, message });
  }

  onMessage(): Observable<Message> {
    return new Observable(observer => {
      this.socket?.on('receive-message', (message: Message) => {
        observer.next(message);
      });
    });
  }
}
