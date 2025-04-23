import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, BehaviorSubject, map } from 'rxjs';
import { Annotation } from '../models/annotation/annotation.model';

/**
 * Сервис для управления аннотациями документа
 */
@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  // Используем сигнал для хранения аннотаций
  private readonly annotations = signal<Map<string, Annotation>>(new Map());
  
  // Map для хранения BehaviorSubject для каждой страницы
  private pageAnnotationsSubjects = new Map<number, BehaviorSubject<Annotation[]>>();
  
  // Метод возвращает Observable для обратной совместимости с компонентами, которые ожидают Observable
  getAnnotations(page: number): Observable<Annotation[]> {
    // Проверяем, есть ли уже BehaviorSubject для этой страницы
    if (!this.pageAnnotationsSubjects.has(page)) {
      // Если нет, создаем новый с начальным значением
      const initialAnnotations = Array.from(this.annotations().values())
        .filter(a => a.page === page);
      
      this.pageAnnotationsSubjects.set(page, new BehaviorSubject<Annotation[]>(initialAnnotations));
    }
    
    // Возвращаем Observable из существующего BehaviorSubject
    return this.pageAnnotationsSubjects.get(page)!.asObservable();
  }

  /**
   * Обновляет все BehaviorSubject для соответствующих страниц
   */
  private updatePageSubjects(): void {
    // Получаем текущее состояние сигнала
    const annotationsMap = this.annotations();
    const allAnnotations = Array.from(annotationsMap.values());
    
    // Получаем уникальные номера страниц
    const pages = new Set(allAnnotations.map(a => a.page));
    
    // Обновляем BehaviorSubject для каждой страницы
    for (const page of pages) {
      const pageAnnotations = allAnnotations.filter(a => a.page === page);
      
      // Если BehaviorSubject для этой страницы существует, обновляем его
      if (this.pageAnnotationsSubjects.has(page)) {
        this.pageAnnotationsSubjects.get(page)!.next(pageAnnotations);
      }
    }
  }

  /**
   * Добавляет аннотацию
   */
  addAnnotation(annotation: Omit<Annotation, 'id'>): void {
    const id = this.generateId();
    const newAnnotation: Annotation = { ...annotation, id };
    
    this.annotations.update(annotationsMap => {
      const newMap = new Map(annotationsMap);
      newMap.set(id, newAnnotation);
      return newMap;
    });
    
    // Обновляем BehaviorSubject для соответствующей страницы
    this.updatePageSubjects();
  }

  /**
   * Обновляет аннотацию
   */
  updateAnnotation(annotation: Annotation): void {
    this.annotations.update(annotationsMap => {
      const newMap = new Map(annotationsMap);
      newMap.set(annotation.id, annotation);
      return newMap;
    });
    
    // Обновляем BehaviorSubject для соответствующей страницы
    this.updatePageSubjects();
  }

  /**
   * Удаляет аннотацию
   */
  deleteAnnotation(id: string): void {
    // Запоминаем страницу перед удалением
    const page = this.annotations().get(id)?.page;
    
    this.annotations.update(annotationsMap => {
      const newMap = new Map(annotationsMap);
      newMap.delete(id);
      return newMap;
    });
    
    // Обновляем BehaviorSubject для соответствующей страницы
    this.updatePageSubjects();
    
    // Если у нас есть страница и для неё существует BehaviorSubject,
    // проверяем, остались ли на ней аннотации
    if (page !== undefined && this.pageAnnotationsSubjects.has(page)) {
      const pageAnnotations = Array.from(this.annotations().values())
        .filter(a => a.page === page);
      
      // Если аннотаций не осталось, явно отправляем пустой массив
      // что гарантирует обновление интерфейса
      this.pageAnnotationsSubjects.get(page)!.next(pageAnnotations);
    }
  }

  /**
   * Создает аннотацию (алиас для addAnnotation)
   */
  createAnnotation(annotation: Omit<Annotation, 'id'>): void {
    this.addAnnotation(annotation);
  }

  /**
   * Генерирует уникальный числовой ID
   */
  private generateId(): string {
    // Генерируем уникальный ID с помощью crypto UUID
    return crypto.randomUUID();
  }
} 