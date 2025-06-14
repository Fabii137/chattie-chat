import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Server } from '../entities/server.entity';
import { environment } from '../environments/environment';
import { Room } from '../entities/room.entity';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class ServerService {
    constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

    getServerById(serverId: number): Observable<Server> {
        const url = `${environment.apiURL}servers/${serverId}`;
        return this.http.get<Server>(url, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    createServer(name: string, iconUrl?: string): Observable<Server> {
        const url = `${environment.apiURL}servers/create`;
        return this.http.post<Server>(url, { name, iconUrl }, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    deleteServer(serverId: number): Observable<void> {
        const url = `${environment.apiURL}servers/${serverId}/delete`;
        return this.http.delete<void>(url, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    inviteToServer(serverId: number, invites: number[]): Observable<void> {
        const url = `${environment.apiURL}servers/${serverId}/invite`;
        return this.http.post<void>(url, { invites }, { withCredentials: true });
    }

    joinServer(serverId: number): Observable<Server> {
        const url = `${environment.apiURL}servers/${serverId}/join`;
        return this.http.post<Server>(url, {}, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    leaveServer(serverId: number): Observable<void> {
        const url = `${environment.apiURL}servers/${serverId}/leave`;
        return this.http.post<void>(url, {}, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    createRoom(name: string, serverId: number): Observable<Room> {
        const url = `${environment.apiURL}servers/${serverId}/create-room`;
        return this.http.post<Room>(url, { name }, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    private handleError = (error: HttpErrorResponse) => {
    if (error.status) {
      const errorMessage = error.error?.message ? `${error.error.message}` : `Server returned code: ${error.status}`;

      this.snackBar.open(errorMessage, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });

      console.error('ServerService HTTP Error:', errorMessage, error);
    } else {
      console.warn('Non-HTTP error occurred:', error.message || error);
    }

    return throwError(() => error);
  };
}
