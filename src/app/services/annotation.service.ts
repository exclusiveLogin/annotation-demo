import { Injectable, signal, computed, Signal } from '@angular/core';
import { Annotation } from '../models/annotation/annotation.model';

/**
 * Сервис для управления аннотациями документа
 * Использует сигналы Angular для управления состоянием
 */
@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  // Основное хранилище аннотаций
  private readonly annotations = signal<Map<string, Annotation>>(new Map());

  // Вычисляемый сигнал для получения всех аннотаций в виде массива
  readonly allAnnotations = computed(() =>
    Array.from(this.annotations().values())
  );

  /**
   * Получает аннотации для указанной страницы
   * @param page Номер страницы
   * @returns Observable с массивом аннотаций
   */
  getAnnotations(page: number): Annotation[] {
    // Создаем вычисляемый сигнал для фильтрации аннотаций по странице
    const pageAnnotations = computed(() =>
      this.allAnnotations().filter(a => a.page === page)
    );

    return pageAnnotations();
  }

  /**
   * Добавляет новую аннотацию
   * @param annotation Данные аннотации без ID
   * @returns Созданная аннотация с ID
   */
  addAnnotation(annotation: Omit<Annotation, 'id'>): Annotation {
    const id = this.generateId();
    const newAnnotation: Annotation = { ...annotation, id };

    this.annotations.update(annotationsMap => {
      const newMap = new Map(annotationsMap);
      newMap.set(id, newAnnotation);
      return newMap;
    });

    return newAnnotation;
  }

  /**
   * Обновляет существующую аннотацию
   * @param annotation Аннотация с обновленными данными
   * @returns true если аннотация была обновлена, false если аннотация не найдена
   */
  updateAnnotation(annotation: Annotation): boolean {
    if (!this.annotations().has(annotation.id)) {
      return false;
    }

    this.annotations.update(annotationsMap => {
      const newMap = new Map(annotationsMap);
      newMap.set(annotation.id, annotation);
      return newMap;
    });

    return true;
  }

  /**
   * Удаляет аннотацию по ID
   * @param id ID аннотации
   * @returns true если аннотация была удалена, false если аннотация не найдена
   */
  deleteAnnotation(id: string): boolean {
    if (!this.annotations().has(id)) {
      return false;
    }

    this.annotations.update(annotationsMap => {
      const newMap = new Map(annotationsMap);
      newMap.delete(id);
      return newMap;
    });

    return true;
  }

  /**
   * Генерирует уникальный ID для аннотации
   * @private
   */
  private generateId(): string {
    return crypto.randomUUID();
  }
}
