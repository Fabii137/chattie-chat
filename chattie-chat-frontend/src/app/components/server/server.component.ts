import { Component, ElementRef, OnDestroy, OnInit, runInInjectionContext, ViewChild } from '@angular/core';
import { Server } from '../../../entities/server.entity';
import { Room } from '../../../entities/room.entity';
import { Message } from '../../../entities/message.entity';
import { User } from '../../../entities/user.entity';
import { firstValueFrom, Subscription } from 'rxjs';
import { ServerService } from '../../../services/http-backend/server.service';
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

  constructor(
    private serverService: ServerService,
    private authService: AuthService,
    private socketService: SocketService,
    private route: ActivatedRoute,
    private router: Router,
    private matDialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  async ngOnInit(): Promise<void> {
    const user = this.authService.currentUser;
    if (!user)
      return;
    this.currentUser = user;

    const serverId = Number(this.route.snapshot.paramMap.get('serverId'));
    try {
      this.server = await firstValueFrom(this.serverService.getServerById(serverId));
    } catch(err: any) {
      this.openSnackBar(err.message || "Loading server failed");
    }
    
    console.log({currentUser: this.currentUser, room: this.room})

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

    this.room = room;
    this.roomId = room.id;
    this.messages = room.messages.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    this.messageSubscripion?.unsubscribe();
    this.socketService.joinRoom(room.id);
    this.messageSubscripion = this.socketService.onMessage().subscribe(msg => {
      if (msg.room.id === room.id) {
        this.messages.push(msg);
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  sendMessage() {
    console.log({ newMesage: this.newMessage, roomId: this.roomId, currentUser: this.currentUser })
    if (!this.newMessage.trim() || !this.roomId || !this.currentUser)
      return;
    this.socketService.sendMessage(this.roomId, this.currentUser.id, this.newMessage);
    this.newMessage = '';
  }

  openAddRoomDialog() {
    if (!this.currentUser)
      return;
    const dialogRef = this.matDialog.open(NewServerRoomDialogComponent);

    dialogRef.afterClosed().subscribe((result: { roomName: string }) => {
      if (!this.currentUser || !result || !this.server?.id)
        return;
      this.serverService.createRoom(result.roomName, this.server.id, this.currentUser.id).subscribe({
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
      if (!this.server?.id || !this.currentUser?.id || !selectedFriendIds)
        return;

      this.serverService.inviteToServer(this.server.id, this.currentUser.id, selectedFriendIds).subscribe(() => { });
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

