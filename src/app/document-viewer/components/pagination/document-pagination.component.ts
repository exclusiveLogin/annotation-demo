import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Page } from '../../../models/document/page.model';

@Component({
  selector: 'app-document-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-pagination.component.html',
  styleUrls: ['./document-pagination.component.scss']
})
export class DocumentPaginationComponent {
  @Input() pages: Page[] = [];
  @Input() currentPage!: number;
  @Output() pageChange = new EventEmitter<number>();
} 