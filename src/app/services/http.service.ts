import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Location } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Базовый HTTP сервис для работы с API
 * Предоставляет методы для выполнения HTTP-запросов с обработкой ошибок и повторными попытками
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly location = inject(Location);

  /**
   * Выполняет GET-запрос
   * @param url URL-адрес ресурса
   * @param params Параметры запроса
   * @param headers Заголовки запроса
   * @returns Observable с данными ответа
   */
  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    const fullUrl = this.location.prepareExternalUrl(url);
    return this.http.get<T>(fullUrl, { params, headers }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Обрабатывает ошибки HTTP-запросов
   * @param error Объект ошибки
   * @returns Observable с ошибкой
   * @private
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Клиентская ошибка
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Серверная ошибка
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
