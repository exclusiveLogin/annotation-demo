import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-document-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-header.component.html',
  styleUrls: ['./document-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentHeaderComponent {
  // Входные параметры компонента с использованием нового API
  readonly title = input<string>('');
  readonly currentPage = input<number>(1);
  readonly totalPages = input<number>(0);
  readonly canGoNext = input<boolean>(false);
  readonly canGoPrevious = input<boolean>(false);
  readonly zoomLevel = input<number>(1);
  readonly isAnnotationMode = input<boolean>(false);

  // Выходные события компонента с использованием нового API
  readonly previousPage = output<void>();
  readonly nextPage = output<void>();
  readonly goToPage = output<number>();
  readonly createAnnotation = output<void>();
  readonly zoomOut = output<void>();
  readonly resetZoom = output<void>();
  readonly zoomIn = output<void>();

  onGoToPage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const pageNumber = Number(input.value);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= this.totalPages()) {
      this.goToPage.emit(pageNumber);
    }
  }
} 