import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AnnotationService } from './services/annotation.service';
import { MathService } from './services/math.service';
import { DataService } from './services/data.service';
import {provideHttpClient} from "@angular/common/http";

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
    provideHttpClient(),
    provideAnimationsAsync(),
    // Providers from DocumentViewerModule
    AnnotationService,
    MathService,
    DataService
  ]
};
