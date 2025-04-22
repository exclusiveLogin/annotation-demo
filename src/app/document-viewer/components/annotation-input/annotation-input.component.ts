import { Component, EventEmitter, Input, Output, AfterViewInit, ViewChild, ElementRef, ChangeDetectionStrategy, signal, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnnotationData } from '../../../models/annotation/annotation.model';
import { MathService } from '../../../services/math.service';

@Component({
  selector: 'app-annotation-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './annotation-input.component.html',
  styleUrls: ['./annotation-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnotationInputComponent implements AfterViewInit {
  @ViewChild('textInput') textInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly width = input.required<number>();
  readonly height = input.required<number>();
  readonly zoomLevel = input<number>(1);

  readonly save = output<AnnotationData>();
  readonly cancel = output<void>();

  textValue = '';
  
  readonly imageUrl = signal<string | null>(null);
  readonly aspectRatio = signal<number | null>(null);
  readonly originalWidth = signal<number | null>(null);
  readonly originalHeight = signal<number | null>(null);
  readonly previewWidth = signal(200);
  readonly previewHeight = signal(200);
  readonly showInput = signal(true);

  private readonly mathService = inject(MathService);
  private readonly maxPreviewSize = 200;

  ngAfterViewInit(): void {
    this.textInput.nativeElement.focus();
  }

  onSaveClick(): void {
    const data: AnnotationData = {
      text: this.textValue
    };
    
    const currentImageUrl = this.imageUrl();
    if (currentImageUrl) {
      data.imageUrl = currentImageUrl;
      data.aspectRatio = this.aspectRatio() || 1;
      data.originalWidth = this.originalWidth() || 0;
      data.originalHeight = this.originalHeight() || 0;
    }
    
    this.save.emit(data);
  }

  onCancelClick(): void {
    this.cancel.emit();
  }

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      await this.processImage(file);
    }
  }

  async onPaste(event: ClipboardEvent): Promise<void> {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          await this.processImage(file);
          break;
        }
      }
    }
  }

  private async processImage(file: File): Promise<void> {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.imageUrl.set(img.src);
        const ratio = img.width / img.height;
        this.aspectRatio.set(ratio);
        this.originalWidth.set(img.width);
        this.originalHeight.set(img.height);
        
        // Используем сервис для расчета пропорций предпросмотра
        const previewDimensions = this.mathService.calculatePreviewDimensions(
          img.width, 
          img.height, 
          this.maxPreviewSize
        );
        
        this.previewWidth.set(previewDimensions.width);
        this.previewHeight.set(previewDimensions.height);
      };
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageUrl.set(null);
    this.aspectRatio.set(null);
    this.originalWidth.set(null);
    this.originalHeight.set(null);
    this.previewWidth.set(this.maxPreviewSize);
    this.previewHeight.set(this.maxPreviewSize);
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
} 