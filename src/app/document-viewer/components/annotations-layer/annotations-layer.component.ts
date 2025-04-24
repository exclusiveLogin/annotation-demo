import { Component, HostListener, ElementRef, ChangeDetectionStrategy, inject, signal, input, effect, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { DataService } from '../../../services/data.service';
import { MathService } from '../../../services/math.service';
import { Annotation } from '../../../models/annotation/annotation.model';
import { DragState } from '../../../models/common/drag-state.model';

@Component({
  selector: 'app-annotations-layer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './annotations-layer.component.html',
  styleUrls: ['./annotations-layer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationsLayerComponent implements OnInit, OnDestroy {
  private readonly dataService = inject(DataService);
  private readonly elementRef = inject(ElementRef);
  private readonly mathService = inject(MathService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly page = input.required<number>();

  readonly selectedId = signal<string | null>(null);
  readonly dragState = signal<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    originalX: 0,
    originalY: 0
  });

  private activeAnnotation = signal<Annotation | null>(null);
  annotations$: BehaviorSubject<Annotation[]> = new BehaviorSubject<Annotation[]>([]);

  private mouseMoveListener: any;
  private mouseUpListener: any;

  constructor() {
    effect(() => {
      const pageValue = this.page();
      this.updateAnnotations(pageValue);
    });
  }

  ngOnInit(): void {
    // Initialization done in constructor effect
  }

  updateAnnotations(page: number): void {
    this.resetSelection();
    const annotations =  this.dataService.getAnnotations(page);
    this.annotations$.next(annotations);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.selectedId()) return;

    const annotationElements = this.elementRef.nativeElement.querySelectorAll('.annotation');

    if (!this.mathService.isClickInsideAnyElement(event, annotationElements)) {
      this.resetSelection();
    }
  }

  private resetSelection(): void {
    this.selectedId.set(null);
    this.activeAnnotation.set(null);
  }

  onAnnotationClick(annotation: Annotation, event: MouseEvent): void {
    event.stopPropagation();
    if (this.selectedId() === annotation.id) {
      this.resetSelection();
    } else {
      this.selectedId.set(annotation.id);
      this.activeAnnotation.set(annotation);
    }
  }

  onDelete(id: string): void {
    this.dataService.deleteAnnotation(id);
    this.updateAnnotations(this.page());
    this.resetSelection();
  }

  onMoveStart(event: MouseEvent, annotation: Annotation): void {
    this.activeAnnotation.set(annotation);
    this.selectedId.set(annotation.id);

    this.dragState.set(this.mathService.initDragState(event, annotation.x, annotation.y));

    this.removeDocumentListeners();

    this.mouseMoveListener = (moveEvent: MouseEvent) => {
      if (this.dragState().isDragging) {
        const newPosition = this.mathService.calculateDragPosition(moveEvent, this.dragState());

        const updatedAnnotation = {
          ...annotation,
          x: newPosition.x,
          y: newPosition.y
        };

        this.dataService.updateAnnotation(updatedAnnotation);
        this.cdr.markForCheck();
        moveEvent.preventDefault();
      }
    };

    this.mouseUpListener = (upEvent: MouseEvent) => {
      if (this.dragState().isDragging) {
        this.dragState.set(this.mathService.resetDragState());

        this.removeDocumentListeners();
        upEvent.preventDefault();
      }
    };

    document.addEventListener('mousemove', this.mouseMoveListener);
    document.addEventListener('mouseup', this.mouseUpListener);

    event.preventDefault();
    event.stopPropagation();
  }

  private removeDocumentListeners(): void {
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }

    if (this.mouseUpListener) {
      document.removeEventListener('mouseup', this.mouseUpListener);
      this.mouseUpListener = null;
    }
  }

  ngOnDestroy(): void {
    this.removeDocumentListeners();
  }
}
