import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Room, RoomType } from '../../../entities/room.entity';
import { RoomService } from '../../../services/http-backend/room.service';
import { SocketService } from '../../../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../entities/user.entity';
import { firstValueFrom, Subscription } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UserService } from '../../../services/http-backend/user.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Message } from '../../../entities/message.entity';

@Component({
  selector: 'app-room',
  standalone: true,
  imports: [
    MatSidenavModule,
    CommonModule,
    MatInputModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css'],
})
export class RoomComponent implements OnInit {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  room: Room | null = null;
  roomId: number | null = null;
  messages: Message[] = [];

  currentUser: User | null = null;

  private messageSubscripion: Subscription | null = null;
  newMessage: string = '';

  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUser();
    await this.loadRoom();
    if(this.room && this.room.id) {
      this.socketService.joinRoom(this.room.id);
      this.messageSubscripion?.unsubscribe();
      this.messageSubscripion = this.socketService.onMessage().subscribe((message: Message) => {
        if(message.room.id === this.roomId) {
          this.messages.push(message);
          this.scrollToBottom();
        }
      });
    }
      
  }

  async loadCurrentUser() {
    const user = this.authService.currentUser;
    if (!user)
      return;

    this.currentUser = await firstValueFrom(this.userService.getUserById(user.id));
  }

  async loadRoom() {
    const id = this.route.snapshot.paramMap.get("roomId");
    if (!id)
      return;

    const user = this.authService.currentUser;
    if (!user)
      return;

    this.roomId = Number(id);

    this.room = await firstValueFrom(this.roomService.getRoomById(this.roomId, user.id));
    this.messages = this.room.messages ?? [];
  }

  getRoomIcon(room: Room): string | null {
    if (room.type !== RoomType.DM)
      return null;
    const friend = room.users.filter((u) => u.id !== this.currentUser?.id)[0];
    return friend?.avatarUrl || 'assets/img/default.jpg';
  }

  selectRoom(room: Room) {
    if (room.id === this.roomId)
      return;
    this.router.navigate(['/rooms', room.id]);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.roomId || !this.currentUser)
      return;
    this.socketService.sendMessage(this.roomId, this.currentUser?.id, this.newMessage);
    this.newMessage = "";
  }

  scrollToBottom() {
    setTimeout(() => {
      if(this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
