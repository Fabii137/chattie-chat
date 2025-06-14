import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Room } from '../entities/room.entity';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class RoomService {
    constructor(private http: HttpClient) { }

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

    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Client error: ${error.error.message}`;
        } else if (error.error && error.error.message) {
            errorMessage = `${error.error.message}`;
        } else {
            errorMessage = `Server returned code: ${error.status}`;
        }
        console.error('RoomService Error:', errorMessage);

        return throwError(() => new Error(errorMessage));
    }
}
