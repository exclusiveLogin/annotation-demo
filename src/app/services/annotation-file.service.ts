import { Injectable } from '@angular/core';
import { Annotation } from '../models/annotation/annotation.model';

@Injectable({
  providedIn: 'root'
})
export class AnnotationFileService {
  /**
   * Сохраняет аннотации в JSON файл
   * @param annotations Массив аннотаций для сохранения
   */
  saveToFile(annotations: Annotation[]): void {
    // Преобразуем аннотации в формат для сохранения
    const annotationsToSave = annotations.map(annotation => ({
      ...annotation,
      // Убедимся, что все числовые поля имеют правильный тип
      id: Number(annotation.id),
      page: Number(annotation.page),
      x: Number(annotation.x),
      y: Number(annotation.y),
      width: Number(annotation.width),
      height: Number(annotation.height)
    }));

    const annotationsJson = JSON.stringify(annotationsToSave, null, 2);
    console.log('Saving annotations to file:', annotationsToSave);
    
    const blob = new Blob([annotationsJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotations.json';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  /**
   * Загружает аннотации из JSON файла
   * @param file Файл для загрузки
   * @returns Promise с массивом аннотаций
   */
  loadFromFile(file: File): Promise<Annotation[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const rawAnnotations = JSON.parse(event.target?.result as string);
          // Валидация и преобразование загруженных данных
          const annotations = rawAnnotations.map((annotation: any) => ({
            id: Number(annotation.id),
            page: Number(annotation.page),
            x: Number(annotation.x),
            y: Number(annotation.y),
            width: Number(annotation.width),
            height: Number(annotation.height),
            text: String(annotation.text),
            imageUrl: annotation.imageUrl ? String(annotation.imageUrl) : undefined,
            aspectRatio: annotation.aspectRatio ? Number(annotation.aspectRatio) : undefined,
            originalWidth: annotation.originalWidth ? Number(annotation.originalWidth) : undefined,
            originalHeight: annotation.originalHeight ? Number(annotation.originalHeight) : undefined
          }));
          
          console.log('Loaded annotations from file:', annotations);
          resolve(annotations);
        } catch (error) {
          console.error('Error parsing annotations file:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };

      reader.readAsText(file);
    });
  }
} 