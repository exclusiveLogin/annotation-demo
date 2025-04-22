import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Базовый HTTP сервис для работы с API
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly http = inject(HttpClient);

  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(url, { params, headers });
  }
} 