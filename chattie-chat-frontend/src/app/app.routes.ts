import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'friends', pathMatch: 'full' },
    { path: 'friends', loadComponent: () => import('./components/friends/friends.component').then(m => m.FriendsComponent), title: 'Friends', canActivate: [AuthGuard] },
    { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), title: 'Login' },
    { path: 'rooms', loadComponent: () => import('./components/room/room.component').then(m => m.RoomComponent), title: 'Rooms', canActivate: [AuthGuard] },
    { path: 'rooms/:roomId', loadComponent: () => import('./components/room/room.component').then(m => m.RoomComponent), title: 'Room', canActivate: [AuthGuard] },
    { path: 'servers/:serverId', loadComponent: () => import('./components/server/server.component').then(m => m.ServerComponent), title: 'Server', canActivate: [AuthGuard] },
    { path: '**', redirectTo: 'friends' }
];
