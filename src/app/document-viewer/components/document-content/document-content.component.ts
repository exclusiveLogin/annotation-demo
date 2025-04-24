import { Component, Output, EventEmitter, ViewChild, OnDestroy, ElementRef, signal, ChangeDetectionStrategy,
         OnChanges, SimpleChanges, AfterViewInit, ChangeDetectorRef, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotationsLayerComponent } from '../annotations-layer/annotations-layer.component';
import { DataService } from '../../../services/data.service';
import { AnnotationInputComponent } from '../annotation-input/annotation-input.component';
import { Page } from '../../../models/document/page.model';
import { Subscription } from 'rxjs';
import { MathService } from '../../../services/math.service';
import { Box } from '../../../models/common/box.model';
import { AnnotationData } from '../../../models/annotation/annotation.model';

@Component({
  selector: 'app-document-content',
  standalone: true,
  imports: [
    CommonModule,
    AnnotationsLayerComponent,
    AnnotationInputComponent
  ],
  templateUrl: './document-content.component.html',
  styleUrls: ['./document-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentContentComponent implements OnDestroy, OnChanges, AfterViewInit {
  readonly pageData = input.required<Page>();
  readonly annotationMode = input<boolean>(false);
  readonly zoomLevel = input<number>(1);

  readonly annotationCreated = output<void>();
  readonly annotationCancelled = output<void>();

  @ViewChild(AnnotationsLayerComponent) private layer!: AnnotationsLayerComponent;
  @ViewChild('pageContainer') private pageContainer!: ElementRef<HTMLElement>;
  @ViewChild('pageWrapper') private pageWrapper!: ElementRef<HTMLElement>;

  readonly box = signal<Box | null>(null);
  readonly drawing = signal(false);
  readonly showInput = signal(false);
  private readonly startX = signal(0);
  private readonly startY = signal(0);
  private readonly isSaving = signal(false);
  private readonly subscription = new Subscription();
  readonly currentPageData = signal<Page | null>(null);
  private readonly isAnimating = signal(false);
  private readonly nextPageData = signal<Page | null>(null);
  private readonly transitionDirection = signal<'left' | 'right'>('right');

  private readonly dataService = inject(DataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly mathService = inject(MathService);

  ngAfterViewInit(): void {
    this.subscription.add(
      this.handleTransitionEnd()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageData'] && !changes['pageData'].firstChange) {
      const newPage = this.pageData();
      const currentPage = this.currentPageData();

      this.nextPageData.set(newPage);
      if (currentPage) {
        this.transitionDirection.set(newPage.number > currentPage.number ? 'right' : 'left');
      }
      this.startPageTransition();
    } else if (changes['pageData']?.firstChange) {
      this.currentPageData.set(this.pageData());
    }
  }

  private handleTransitionEnd() {
    const wrapper = this.pageWrapper.nativeElement;

    const handleTransition = () => {
      if (wrapper.classList.contains('page-leave')) {
        this.currentPageData.set(this.nextPageData());
        this.nextPageData.set(null);
        wrapper.classList.remove('page-leave', 'left', 'right');
        wrapper.classList.add('page-enter');
        this.cdr.markForCheck();
      } else if (wrapper.classList.contains('page-enter')) {
        wrapper.classList.remove('page-enter', 'left', 'right');
        this.isAnimating.set(false);
        this.cdr.markForCheck();
      }
    };

    wrapper.addEventListener('transitionend', handleTransition);

    return () => {
      wrapper.removeEventListener('transitionend', handleTransition);
    };
  }

  private startPageTransition(): void {
    if (this.isAnimating()) return;
    this.isAnimating.set(true);

    const wrapper = this.pageWrapper.nativeElement;
    wrapper.classList.add('page-leave');
    wrapper.classList.add(this.transitionDirection());
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.annotationMode() || event.button !== 0) return;

    const { x, y } = this.mathService.getCoordinates(event, this.pageContainer.nativeElement, this.zoomLevel());
    this.startX.set(x);
    this.startY.set(y);
    this.box.set({ x, y, width: 0, height: 0 });
    this.drawing.set(true);
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.drawing() || !this.box()) return;

    const { x, y } = this.mathService.getCoordinates(event, this.pageContainer.nativeElement, this.zoomLevel());
    this.box.set(this.mathService.updateBoxDimensions(this.startX(), this.startY(), x, y));
  }

  onMouseUp(): void {
    if (!this.drawing()) return;
    this.drawing.set(false);
    this.showInput.set(true);
  }

  onSave(data: AnnotationData): void {
    const currentBox = this.box();
    if (!currentBox || this.isSaving()) return;

    this.isSaving.set(true);
    const pageEl = this.pageContainer.nativeElement;
    const rect = pageEl.getBoundingClientRect();
    const maxWidth = rect.width / this.zoomLevel();
    const maxHeight = rect.height / this.zoomLevel();

    const adjustedBox = this.mathService.adjustBoxForAspectRatio(
      currentBox,
      data.aspectRatio,
      maxWidth,
      maxHeight
    );

    this.dataService.addAnnotation({
      page: this.pageData().number,
      ...adjustedBox,
      text: data.text,
      imageUrl: data.imageUrl,
      aspectRatio: data.aspectRatio,
      originalWidth: data.originalWidth,
      originalHeight: data.originalHeight
    });

    if (this.layer) {
      this.layer.updateAnnotations(this.pageData().number);
    }

    this.resetDrawing();
    this.annotationCreated.emit();
    this.isSaving.set(false);
    this.cdr.markForCheck();
  }

  onCancel(): void {
    this.resetDrawing();
    this.annotationCancelled.emit();
  }

  private resetDrawing(): void {
    this.box.set(null);
    this.drawing.set(false);
    this.showInput.set(false);
  }
}
