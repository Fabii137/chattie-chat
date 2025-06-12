import { Routes } from '@angular/router';
import { FriendsComponent } from './components/friends/friends.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from '../guards/auth.guard';
import { RoomComponent } from './components/room/room.component';
import { ServerComponent } from './components/server/server.component';

export const routes: Routes = [
    { path: '', redirectTo: 'friends', pathMatch: 'full' },
    { path: 'friends', component: FriendsComponent, title: 'Friends', canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'rooms', component: RoomComponent, title: 'Rooms', canActivate: [AuthGuard] },
    { path: 'rooms/:roomId', component: RoomComponent, title: 'Room', canActivate: [AuthGuard] },
    { path: 'servers/:serverId', component: ServerComponent, title: 'Server', canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'friends' }
];
