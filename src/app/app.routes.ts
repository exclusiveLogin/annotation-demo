import { Routes } from '@angular/router';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'page/1', pathMatch: 'full' },
  { path: 'page/:pageId', component: DocumentViewerComponent },
  { path: '**', redirectTo: 'page/1' }
];
