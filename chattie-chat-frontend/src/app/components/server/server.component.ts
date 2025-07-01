import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Server } from '../../../entities/server.entity';
import { Room } from '../../../entities/room.entity';
import { Message } from '../../../entities/message.entity';
import { User } from '../../../entities/user.entity';
import { firstValueFrom, Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { SocketService } from '../../../services/socket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { NewServerRoomDialogComponent } from './new-server-room-dialog/new-server-room-dialog.component';
import { MatMenuModule } from '@angular/material/menu'
import { InviteFriendDialogComponent } from './invite-friend-dialog/invite-friend-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServerService } from '../../../services/server.service';
import { RoomService } from '../../../services/room.service';


@Component({
  selector: 'app-server',
  imports: [MatFormFieldModule, MatInputModule, CommonModule, FormsModule, MatSidenavModule, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './server.component.html',
  styleUrl: './server.component.css'
})
export class ServerComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  server: Server | null = null;
  room: Room | null = null;
  roomId: number | null = null;
  messages: Message[] = [];

  newMessage: string = "";

  currentUser: User | null = null;
  private messageSubscripion: Subscription | null = null;
  private routeSubscription?: Subscription;

  constructor(
    private serverService: ServerService,
    private authService: AuthService,
    private socketService: SocketService,
    private roomService: RoomService,
    private route: ActivatedRoute,
    private router: Router,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit(): Promise<void> {
    this.currentUser = this.authService.currentUser;

    this.routeSubscription = this.route.paramMap.subscribe(async paramMap => {
      this.room = null;
      const serverId = Number(this.route.snapshot.paramMap.get('serverId'));
      try {
        this.server = await firstValueFrom(this.serverService.getServerById(serverId));
      } catch (err: any) {
        this.openSnackBar(err.message || "Loading server failed");
      }
    })
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    this.messageSubscripion?.unsubscribe();
  }

  async selectRoom(room: Room) {
    if (!room || !room.id)
      return;

    if (this.roomId === room.id)
      return;

    this.roomId = room.id;
    this.room = await firstValueFrom(this.roomService.getRoomById(this.roomId));

    this.messages = this.room.messages || [];
    this.setupSocket(this.roomId);
    this.scrollToBottom();
  }

  setupSocket(roomId: number) {
    this.messageSubscripion?.unsubscribe();
    this.socketService.joinRoom(roomId);
    this.messageSubscripion = this.socketService.onMessage().subscribe(msg => {
      if (msg.room.id === roomId) {
        this.messages.push(msg);
        if (this.messages.length > 200) {
          this.messages.shift();
        }
        this.scrollToBottom();
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.roomId)
      return;
    this.socketService.sendMessage(this.roomId, this.newMessage);
    this.newMessage = '';
  }

  openAddRoomDialog() {
    const dialogRef = this.matDialog.open(NewServerRoomDialogComponent);

    dialogRef.afterClosed().subscribe((result: { roomName: string }) => {
      if (!result || !this.server?.id)
        return;
      this.serverService.createRoom(result.roomName, this.server.id).subscribe({
        next: (room) => {
          this.openSnackBar("Successfully created room");
          this.server?.rooms.push(room);
        },
        error: (err) => {
          this.openSnackBar(err.message || "Creating room failed");
        },

      })
    });
  }

  openInviteDialog() {
    if (!this.currentUser || !this.server)
      return;

    const dialogRef = this.matDialog.open(InviteFriendDialogComponent, {
      data: {
        serverName: this.server.name,
        friends: this.currentUser.friends,
      }
    });

    dialogRef.afterClosed().subscribe((selectedFriendIds: number[]) => {
      if (!this.server?.id || !selectedFriendIds)
        return;

      this.serverService.inviteToServer(this.server.id, selectedFriendIds).subscribe(() => { });
    });
  }

  openSettingsDialog() {
    // TODO:
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
    });
  }
}

