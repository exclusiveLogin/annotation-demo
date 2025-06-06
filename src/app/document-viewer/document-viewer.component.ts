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
import { AnnotationFileService } from '../services/annotation-file.service';
import { Annotation } from '../models/annotation/annotation.model';
import { AnnotationService } from '../services/annotation.service';

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
  private readonly annotationService = inject(AnnotationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly annotationFileService = inject(AnnotationFileService);

  // UI State
  readonly isCreatingAnnotation = signal<boolean>(false);
  readonly zoomLevel = signal<number>(1);
  readonly minZoom = 0.1;
  readonly maxZoom = 3;
  readonly zoomStep = 0.1;

  // Данные из сервисов
  readonly documentData = this.dataService.getDocument();
  readonly pages = this.dataService.getPages();
  readonly title = this.dataService.getDocumentName();

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
    const pageNumber = this.currentPageNumber();
    return this.pages()?.find(p => p.number === pageNumber);
  });

  readonly firstPage = computed(() => this.pages()?.at(0)?.number);

  readonly totalPages = computed(() => this.documentData()?.pages.length || 0);

  readonly canGoNext = computed(() => {
    const current = this.currentPageNumber();
    const total = this.totalPages() || 0;
    return current < total;
  });

  readonly canGoPrevious = computed(() => this.currentPageNumber() > 1);

  constructor() {
    // Эффект для управления валидацией страницы
    effect(() => {
      const currentPage = this.currentPage();
  
      // Если страницы еще не загружены, не делаем ничего
      if (!this.pages() || !this.pages().length) return;

      // Проверяем, существует ли запрошенная страница
      const pageExists = this.pages().some(p => p.number === currentPage?.number);

      // Если запрошенная страница не существует, перенаправляем на первую страницу
      if (!pageExists && this.firstPage()) {
        this.router.navigate(['/page', this.firstPage()]);
      }
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
    const annotations = await this.annotationService.allAnnotations();
    this.annotationFileService.saveToFile(annotations);
  }

  async onLoadAnnotations(file: File): Promise<void> {
    try {
      const annotations = await this.annotationFileService.loadFromFile(file);
      // Очищаем существующие аннотации и добавляем новые
      for (const annotation of annotations) {
        // Создаем новую аннотацию без id, так как он будет сгенерирован сервисом
        const { id, ...annotationData } = annotation;
        this.dataService.addAnnotation(annotationData);
      }
      console.log('Annotations loaded successfully');
    } catch (error) {
      console.error('Failed to load annotations:', error);
    }
  }
}
