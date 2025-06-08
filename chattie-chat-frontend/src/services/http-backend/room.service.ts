import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Room } from '../../entities/room.entity';

@Injectable({ providedIn: 'root' })
export class RoomService {
    constructor(private http: HttpClient) { }

    openDMRoom(userAId: string, userBId: string): Observable<Room> {
        const url = `${environment.apiURL}dm/open`;
        return this.http.post<Room>(url, { userAId, userBId }).pipe(
            catchError(this.handleError)
        );
    }

    createGroupRoom(name: string, creatorId: number, userIds: number[]): Observable<Room> {
        const url = `${environment.apiURL}groups/create`;
        return this.http.post<Room>(url, { name, creatorId, userIds }).pipe(
            catchError(this.handleError)
        );
    }

    createServerRoom(name: string, creatorId: number, serverId: number): Observable<Room> {
        const url = `${environment.apiURL}servers/${serverId}/rooms/create`;
        return this.http.post<Room>(url, { name, creatorId }).pipe(
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
        console.error('UserService Error:', errorMessage);

        return throwError(() => new Error(errorMessage));
    }
}
