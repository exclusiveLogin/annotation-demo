/**
 * Представляет аннотацию на странице документа
 */
export interface Annotation {
  id: number;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  imageUrl?: string;
  aspectRatio?: number;
  originalWidth?: number;
  originalHeight?: number;
}

/**
 * Данные для создания аннотации
 */
export interface AnnotationData {
  text: string;
  imageUrl?: string;
  aspectRatio?: number;
  originalWidth?: number;
  originalHeight?: number;
} 