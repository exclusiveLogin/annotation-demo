import {Injectable, inject, computed, Signal} from '@angular/core';
import { Observable } from 'rxjs';
import { Page, DocumentData } from '../models/document/page.model';
import { AnnotationService } from './annotation.service';
import { Annotation } from '../models/annotation/annotation.model';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {HttpService} from "./http.service";

/**
 * Сервис для работы с данными документа и аннотациями
 * Использует сигналы Angular для управления состоянием
 */
@Injectable({
  providedIn: 'root'
})
export class DataService {
    private readonly dataUrl = '/pages/data.json';
  private readonly annotationService = inject(AnnotationService);
  private readonly http = inject(HttpService);
  private readonly manifest = toSignal(this.http.get<DocumentData>(this.dataUrl));

  // Статические данные документа
  private readonly documentData = computed(() => this.manifest());

  // Вычисляемые сигналы
  readonly document = computed(() => this.documentData());
  readonly pages = computed(() => this.document()?.pages ?? []);
  readonly documentName = computed(() => this.document()?.name || 'Annotation DEMO');

  /**
   * Получает данные документа
   * @returns Observable с данными документа
   */
  getDocument(): Signal<DocumentData | undefined> {
    return this.document;
  }

  /**
   * Получает массив страниц документа
   * @returns Observable с массивом страниц
   */
  getPages(): Signal<Page[]> {
    return this.pages;
  }

    /**
     * Получает title документа
     * @returns Observable с массивом страниц
     */
    getDocumentName(): Signal<string> {
        return this.documentName;
    }

  /**
   * Получает аннотации для указанной страницы
   * @param page Номер страницы
   * @returns Observable с массивом аннотаций
   */
  getAnnotations(page: number): Annotation[] {
    return this.annotationService.getAnnotations(page);
  }

  /**
   * Добавляет новую аннотацию
   * @param annotation Данные аннотации без ID
   * @returns Созданная аннотация с ID
   */
  addAnnotation(annotation: Omit<Annotation, 'id'>): Annotation {
    return this.annotationService.addAnnotation(annotation);
  }

  /**
   * Обновляет существующую аннотацию
   * @param annotation Аннотация с обновленными данными
   * @returns true если аннотация была обновлена, false если аннотация не найдена
   */
  updateAnnotation(annotation: Annotation): boolean {
    return this.annotationService.updateAnnotation(annotation);
  }

  /**
   * Удаляет аннотацию по ID
   * @param id ID аннотации
   * @returns true если аннотация была удалена, false если аннотация не найдена
   */
  deleteAnnotation(id: string): boolean {
    return this.annotationService.deleteAnnotation(id);
  }
}
