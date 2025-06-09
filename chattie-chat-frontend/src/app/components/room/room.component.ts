import { Component, OnInit } from '@angular/core';
import { Room } from '../../../entities/room.entity';
import { RoomService } from '../../../services/http-backend/room.service';
import { SocketService } from '../../../services/socket.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../entities/user.entity';
import { firstValueFrom } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { UserService } from '../../../services/http-backend/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-room',
  imports: [MatSidenavModule, CommonModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit {
  room: Room | null = null;
  roomId: number | null = null;

  currentUser: User | null = null;

  constructor(private roomService: RoomService, private userService: UserService, private authService: AuthService, private socketService: SocketService, private route: ActivatedRoute) {

  }

  async ngOnInit(): Promise<void> {
    await this.loadRoom();
    await this.loadCurrentUser();
  }

  async loadCurrentUser() {
    const user = this.authService.currentUser;
    if(!user)
      return;

    this.currentUser = await firstValueFrom(this.userService.getUserById(user.id));
    console.log(this.currentUser.privateRooms);
    console.log(this.currentUser.privateRooms[0].name);
  }

  async loadRoom() {
    const id = this.route.snapshot.paramMap.get("roomId");
    if (!id)
      return null;

    const user = this.authService.currentUser;
    if (!user)
      return null;

    this.roomId = Number(id);

    const room = await firstValueFrom(this.roomService.getRoomById(this.roomId, user.id));
    return room;
  }

}
