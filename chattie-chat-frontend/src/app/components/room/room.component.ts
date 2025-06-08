import { Component, OnInit } from '@angular/core';
import { Room } from '../../../entities/room.entity';
import { RoomService } from '../../../services/http-backend/room.service';
import { SocketService } from '../../../services/socket.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../entities/user.entity';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-room',
  imports: [],
  templateUrl: './room.component.html',
  styleUrl: './room.component.css'
})
export class RoomComponent implements OnInit {
  room: Room | null = null;
  roomId: number | null = null;

  constructor(private roomService: RoomService, private authService: AuthService, private socketService: SocketService, private route: ActivatedRoute) {

  }

  async ngOnInit(): Promise<void> {
    await this.loadRoom();
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
