import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnnotationService } from '../services/annotation.service';
import { MathService } from '../services/math.service';

/**
 * @deprecated Модуль просмотра документов больше не используется.
 * В Angular 19 используются standalone компоненты и функциональные подходы.
 * Сервисы AnnotationService и MathService теперь предоставляются на уровне приложения в app.config.ts.
 * Этот модуль сохранен только для обратной совместимости и будет удален в будущих версиях.
 */
@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    // Providers moved to app.config.ts
    // Commented out to prevent duplicate provider errors
    // AnnotationService,
    // MathService
  ]
})
export class DocumentViewerModule { } 