import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Room, RoomType } from '../../../entities/room.entity';
import { SocketService } from '../../../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../entities/user.entity';
import { firstValueFrom, Subscription } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Message } from '../../../entities/message.entity';
import { MatDialog } from '@angular/material/dialog';
import { NewGroupDialogComponent } from './new-group-dialog/new-group-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RoomService } from '../../../services/room.service';
import { UserService } from '../../../services/user.service';
import { ServerService } from '../../../services/server.service';

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
    private matDialog: MatDialog,
    private serverService: ServerService,
    private snackBar: MatSnackBar
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
    const user = this.getCurrentUser();
    if (!user)
      return;

    this.authService.currentUser = await firstValueFrom(this.userService.getMe());
  }

  private async loadRoom(roomId: number) {
    this.room = await firstValueFrom(this.roomService.getRoomById(roomId));
    this.messages = (this.room?.messages ?? []).sort((a, b) =>
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
    const currentUser = this.getCurrentUser();
    if (room.type !== RoomType.DM || !currentUser)
      return null;
    const friend = room.users.filter((u) => u.id !== currentUser.id)[0];
    return friend?.avatarUrl || 'assets/img/default.jpg';
  }

  selectRoom(room: Room) {
    if (room.id === this.roomId)
      return;
    this.router.navigate(['/rooms', room.id]);
  }

  async sendMessage() {
    const currentUser = this.getCurrentUser();
    if (!this.newMessage.trim() || !this.roomId || !currentUser)
      return;
    this.socketService.sendMessage(this.roomId, currentUser.id, this.newMessage);
    this.newMessage = "";
  }

  acceptInvite(message: Message) {
    const startIdx = message.content.indexOf('(');
    const endIdx = message.content.indexOf(')');
    const serverIdStr = message.content.slice(startIdx+1, endIdx);
    const serverId = Number(serverIdStr);
    const currentUser = this.getCurrentUser();

    if(!currentUser)
      return;

    this.serverService.joinServer(serverId).subscribe(server => {
      currentUser.servers.push(server);
      this.openSnackBar(`Successfully joined Server ${server.name}`);
    })
  }

  getCurrentUser(): User | null {
    return this.authService.currentUser;
  }

  openNewGroupDialog() {
    const currentUser = this.getCurrentUser();
    if(!currentUser)
      return;
    const dialogRef = this.matDialog.open(NewGroupDialogComponent, {
      data: {
        friends: currentUser.friends,
      },
    });

    dialogRef.afterClosed().subscribe((result: {groupName: string, members: User[]}) => {
      if(!result)
        return;
      this.roomService.createGroupRoom(result.groupName, result.members.map(m => m.id)).subscribe(room => {
        currentUser.privateRooms.push(room);
        this.openSnackBar(`Successfully created group ${room.name}`)
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

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    })
  }
}
