import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.scss']
})
export class DocumentHeaderComponent {
  private _title = signal<string>('');
  private _currentPage = signal<number>(1);
  private _totalPages = signal<number>(0);
  private _canGoNext = signal<boolean>(false);
  private _canGoPrevious = signal<boolean>(false);
  private _zoomLevel = signal<number>(1);
  private _isAnnotationMode = signal<boolean>(false);

  @Input() set title(value: string) { this._title.set(value); }
  @Input() set currentPage(value: number) { this._currentPage.set(value); }
  @Input() set totalPages(value: number) { this._totalPages.set(value); }
  @Input() set canGoNext(value: boolean) { this._canGoNext.set(value); }
  @Input() set canGoPrevious(value: boolean) { this._canGoPrevious.set(value); }
  @Input() set zoomLevel(value: number) { this._zoomLevel.set(value); }
  @Input() set isAnnotationMode(value: boolean) { this._isAnnotationMode.set(value); }

  @Output() previousPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
  @Output() goToPage = new EventEmitter<number>();
  @Output() createAnnotation = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() resetZoom = new EventEmitter<void>();
  @Output() saveAnnotations = new EventEmitter<void>();
  @Output() loadAnnotations = new EventEmitter<File>();

  onGoToPage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pageNumber = Number(input.value);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= this.totalPages) {
      this.goToPage.emit(pageNumber);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.loadAnnotations.emit(input.files[0]);
    }
  }

  // Геттеры для шаблона
  get title() { return this._title(); }
  get currentPage() { return this._currentPage(); }
  get totalPages() { return this._totalPages(); }
  get canGoNext() { return this._canGoNext(); }
  get canGoPrevious() { return this._canGoPrevious(); }
  get zoomLevel() { return this._zoomLevel(); }
  get isAnnotationMode() { return this._isAnnotationMode(); }
} 