import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Room } from '../entities/room.entity';
import { environment } from '../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class RoomService {
    constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

    getRoomById(roomId: number): Observable<Room> {
        const url = `${environment.apiURL}rooms/${roomId}`;
        return this.http.get<Room>(url, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    openDMRoom(userId: number): Observable<Room> {
        const url = `${environment.apiURL}rooms/dm/open`;
        return this.http.post<Room>(url, { userId }, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    createGroupRoom(name: string, userIds: number[]): Observable<Room> {
        const url = `${environment.apiURL}rooms/groups/create`;
        return this.http.post<Room>(url, { name, userIds }, { withCredentials: true }).pipe(
            catchError(this.handleError)
        );
    }

    createServerRoom(name: string, serverId: number): Observable<Room> {
        const url = `${environment.apiURL}servers/${serverId}/rooms/create`;
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

      console.error('RooMService HTTP Error:', errorMessage, error);
    } else {
      console.warn('Non-HTTP error occurred:', error.message || error);
    }

    return throwError(() => error);
  };
}
