import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AnnotationService } from './services/annotation.service';
import { MathService } from './services/math.service';

/**
 * Конфигурация приложения Angular 19
 * Используем функциональный подход к настройке через provide* функции
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding() // Позволяет связывать параметры маршрута с @Input
    ),
    provideClientHydration(),
    provideHttpClient(
      withInterceptorsFromDi() // Включаем поддержку перехватчиков
    ),
    provideAnimationsAsync(),
    // Providers from DocumentViewerModule
    AnnotationService,
    MathService
  ]
};
