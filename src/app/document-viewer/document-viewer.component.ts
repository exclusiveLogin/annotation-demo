import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentHeaderComponent } from './components/document-header/document-header.component';
import { DocumentContentComponent } from './components/document-content/document-content.component';
import { DocumentPaginationComponent } from './components/pagination/document-pagination.component';
import { DataService } from '../services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, filter, withLatestFrom, firstValueFrom } from 'rxjs';
import { DestroyRef } from '@angular/core';
import { AnnotationService } from '../services/annotation.service';
import { AnnotationFileService } from '../services/annotation-file.service';
import { Annotation } from '../models/annotation/annotation.model';

@Component({
  selector: 'app-document-viewer',
  standalone: true,
  imports: [
    CommonModule,
    DocumentHeaderComponent,
    DocumentContentComponent,
    DocumentPaginationComponent
  ],
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentViewerComponent {
  private readonly dataService = inject(DataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly annotationService = inject(AnnotationService);
  private readonly annotationFileService = inject(AnnotationFileService);

  // UI State
  readonly isCreatingAnnotation = signal<boolean>(false);
  readonly zoomLevel = signal<number>(1);
  readonly minZoom = 0.1;
  readonly maxZoom = 3;
  readonly zoomStep = 0.1;

  // Данные из сервисов
  readonly documentData = toSignal(this.dataService.getDocument(), { initialValue: { name: '', pages: [] } });
  
  readonly currentPageNumber = toSignal(
    this.route.paramMap.pipe(
      map(params => {
        const pageId = params.get('pageId');
        return pageId ? Number(pageId) : 1;
      })
    ), 
    { initialValue: 1 }
  );

  // Вычисляемые свойства
  readonly currentPage = computed(() => {
    const data = this.documentData();
    const pageNumber = this.currentPageNumber();
    return data.pages.find(p => p.number === pageNumber) || null;
  });

  readonly totalPages = computed(() => this.documentData().pages.length);
  
  readonly canGoNext = computed(() => {
    const current = this.currentPageNumber();
    const total = this.totalPages();
    return current < total;
  });
  
  readonly canGoPrevious = computed(() => this.currentPageNumber() > 1);

  constructor() {
    // Эффект для управления валидацией страницы
    effect(() => {
      const data = this.documentData();
      const requestedPage = this.currentPageNumber();
      
      // Если страницы еще не загружены, не делаем ничего
      if (!data.pages.length) return;
      
      // Проверяем, существует ли запрошенная страница
      const pageExists = data.pages.some(p => p.number === requestedPage);
      
      // Если запрошенная страница не существует, перенаправляем на первую страницу
      if (!pageExists) {
        const firstPage = data.pages[0]?.number || 1;
        this.router.navigate(['/page', firstPage]);
      }
    });

    this.setupPageNavigation();
  }

  private setupPageNavigation(): void {
    // Переход на предыдущую страницу
    this.route.paramMap.pipe(
      map(params => {
        const pageId = params.get('pageId');
        return pageId ? Number(pageId) : 1;
      }),
      filter(page => page > 1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      // Логика выполняется при изменении параметров маршрута
    });
  }

  onPreviousPage(): void {
    if (this.canGoPrevious()) {
      const currentPage = this.currentPageNumber();
      this.router.navigate(['/page', currentPage - 1]);
    }
  }

  onNextPage(): void {
    if (this.canGoNext()) {
      const currentPage = this.currentPageNumber();
      this.router.navigate(['/page', currentPage + 1]);
    }
  }

  goToPage(pageNumber: number): void {
    this.router.navigate(['/page', pageNumber]);
  }

  onCreateAnnotation(): void {
    this.isCreatingAnnotation.set(true);
  }

  onAnnotationModeEnd(): void {
    this.isCreatingAnnotation.set(false);
  }

  onZoomIn(): void {
    this.zoomLevel.update(value => Math.min(value + this.zoomStep, this.maxZoom));
  }

  onZoomOut(): void {
    this.zoomLevel.update(value => Math.max(value - this.zoomStep, this.minZoom));
  }

  onResetZoom(): void {
    this.zoomLevel.set(1);
  }

  async onSaveAnnotations(): Promise<void> {
    const currentPage = this.currentPageNumber();
    const annotations = await firstValueFrom(this.annotationService.getAnnotations(currentPage));
    this.annotationFileService.saveToFile(annotations);
  }

  async onLoadAnnotations(file: File): Promise<void> {
    try {
      const annotations = await this.annotationFileService.loadFromFile(file);
      // Очищаем существующие аннотации и добавляем новые
      for (const annotation of annotations) {
        // Создаем новую аннотацию без id, так как он будет сгенерирован сервисом
        const { id, ...annotationData } = annotation;
        this.annotationService.addAnnotation(annotationData);
      }
      console.log('Annotations loaded successfully');
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }
} 