/**
 * Представляет страницу документа
 */
export interface Page {
  number: number;
  imageUrl: string;
}

/**
 * Представляет метаданные документа и его страницы
 */
export interface DocumentData {
  name: string;
  pages: Page[];
} 