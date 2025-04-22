import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, catchError, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Page, DocumentData } from '../models/document/page.model';

/**
 * Сервис для работы с данными документа
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly http = inject(HttpService);
  private readonly dataUrl = '/pages/data.json';
  
  // Кеш данных документа
  private readonly documentCache = signal<DocumentData | null>(null);

  /**
   * Получает данные документа
   * @returns Observable с данными документа
   */
  getDocument(): Observable<DocumentData> {
    // Проверяем кеш перед запросом
    const cachedData = this.documentCache();
    if (cachedData) {
      return of(cachedData);
    }
    
    return this.http.get<DocumentData>(this.dataUrl).pipe(
      map(data => ({
        name: data.name,
        pages: data.pages.map(p => this.mapPageData(p))
      })),
      tap(data => this.documentCache.set(data)),
      catchError(error => {
        console.error('Error fetching document data:', error);
        return of({ name: 'Error loading document', pages: [] });
      })
    );
  }

  /**
   * Получает массив страниц документа
   * @returns Observable с массивом страниц
   */
  getPages(): Observable<Page[]> {
    return this.getDocument().pipe(
      map((data: DocumentData) => data.pages),
      catchError(error => {
        console.error('Error fetching pages:', error);
        return of([]);
      })
    );
  }

  /**
   * Преобразует данные страницы из API в формат приложения
   * @private
   */
  private mapPageData(p: any): Page {
    return {
      number: p.number,
      imageUrl: `${p.imageUrl}`
    };
  }
} 