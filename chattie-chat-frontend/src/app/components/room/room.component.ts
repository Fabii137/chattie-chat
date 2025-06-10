import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { NewGroupDialogComponent } from './new-group-dialog/new-group-dialog.component';

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
export class RoomComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  room: Room | null = null;
  roomId: number | null = null;
  messages: Message[] = [];

  currentUser: User | null = null;

  private messageSubscripion: Subscription | null = null;
  private routeSubscription?: Subscription;
  newMessage: string = '';

  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private matDialog: MatDialog
  ) { }

  async ngOnInit(): Promise<void> {
    await this.loadCurrentUser();
    this.routeSubscription = this.route.paramMap.subscribe(async paramMap => {
      const roomIdStr = paramMap.get('roomId');
      if(!roomIdStr)
        return;
      this.roomId = Number(roomIdStr);
      await this.loadRoom(this.roomId);
      this.setupSocket(this.roomId);
    })
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  async loadCurrentUser() {
    const user = this.authService.currentUser;
    if (!user)
      return;

    this.currentUser = await firstValueFrom(this.userService.getUserById(user.id));
  }

  private async loadRoom(roomId: number) {
    if (!this.currentUser) 
      return;

    this.room = await firstValueFrom(this.roomService.getRoomById(roomId, this.currentUser.id));
    this.messages = (this.room.messages ?? []).sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    this.scrollToBottom();
  }

  private setupSocket(roomId: number) {
    this.messageSubscripion?.unsubscribe();
    this.socketService.joinRoom(roomId);
    this.messageSubscripion = this.socketService.onMessage().subscribe((message: Message) => {
      if (message.room.id === roomId) {
        this.messages.push(message);
        this.scrollToBottom();
      }
    });
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

  openNewGroupDialog() {
    if(!this.currentUser)
      return;
    const dialogRef = this.matDialog.open(NewGroupDialogComponent, {
      data: {
        friends: this.currentUser.friends,
      },
    });

    dialogRef.afterClosed().subscribe((result: {groupName: string, members: User[]}) => {
      if(!this.currentUser || !result)
        return;
      this.roomService.createGroupRoom(result.groupName, this.currentUser.id, result.members.map(m => m.id)).subscribe(room => {
        this.currentUser?.privateRooms.push(room);
      })
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}
