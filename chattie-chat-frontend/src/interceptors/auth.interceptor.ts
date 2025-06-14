import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject = new BehaviorSubject<any>(null);

    constructor(private injector: Injector) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const request = req.clone({ withCredentials: true });

        return next.handle(request).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse && error.status === 401 && (error.error?.error === 'AccessTokenExpired' || error.error?.message === 'No auth token')) {
                    const authService = this.injector.get(AuthService);
                    return this.handleRefreshTokenError(authService, request, next);
                }
                return throwError(() => error);
            })
        )
    }

    private handleRefreshTokenError(authService: AuthService, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true; // avoiding requesting multiple refresh tokens
            this.refreshTokenSubject.next(null); // refresh is starting
            return authService.refreshToken().pipe(
                switchMap(() => {
                    this.isRefreshing = false;
                    this.refreshTokenSubject.next(true); // notifies other responses
                    return next.handle(request.clone({ withCredentials: true }));
                }),
                catchError(err => {
                    this.isRefreshing = false;
                    authService.logOut(); // fallback logout if refresh fails
                    return throwError(() => err);
                })
            );
        } else {
            return this.refreshTokenSubject.pipe(
                filter(token => token !== null),
                take(1),
                switchMap(() => next.handle(request.clone({ withCredentials: true })))
            );
        }
    }
}