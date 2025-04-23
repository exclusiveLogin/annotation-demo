import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';

/**
 * Базовый HTTP сервис для работы с API
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly location = inject(Location);

  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    // Префиксируем URL базовым href приложения
    const fullUrl = this.location.prepareExternalUrl(url);
    return this.http.get<T>(fullUrl, { params, headers });
  }
} 