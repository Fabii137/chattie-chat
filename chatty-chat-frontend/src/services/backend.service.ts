// socket.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SocketService {

  constructor(private http: HttpClient) {}


}
