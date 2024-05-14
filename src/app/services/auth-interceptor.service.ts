import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { from, lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  private accessToken = ''

  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next))
  }

  private async handleAccess(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    this.auth.idTokenClaims$.subscribe(
      idToken => this.accessToken = idToken?.__raw!
    )
    const secureEndpoints = ['http://localhost:8080/api/orders']
    if (secureEndpoints.some(url => req.urlWithParams.includes(url))) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + this.accessToken
        }
      })
    }
    return await lastValueFrom(next.handle(req))
  }

}
