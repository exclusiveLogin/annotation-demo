import { Injectable } from '@angular/core';
import { Box } from '../models/common/box.model';
import { DragState } from '../models/common/drag-state.model';

/**
 * Сервис для математических расчетов при работе с координатами и размерами
 */
@Injectable({
  providedIn: 'root'
})
export class MathService {
  /**
   * Преобразует координаты события мыши в координаты относительно элемента с учетом масштаба
   */
  getCoordinates(event: MouseEvent, element: HTMLElement, scale: number): { x: number; y: number } {
    const rect = element.getBoundingClientRect();
    
    // Расчет координат относительно контейнера страницы
    const x = (event.clientX - rect.left) / scale;
    const y = (event.clientY - rect.top) / scale;
    
    // Ограничение координат границами страницы
    return {
      x: Math.max(0, Math.min(x, rect.width / scale)),
      y: Math.max(0, Math.min(y, rect.height / scale))
    };
  }

  /**
   * Корректирует размеры коробки для соблюдения соотношения сторон
   */
  adjustBoxForAspectRatio(box: Box, aspectRatio: number | undefined, maxWidth: number, maxHeight: number): Box {
    if (!aspectRatio) return box;
    
    let newWidth = box.width;
    let newHeight = box.height;
    
    if (box.width >= box.height) {
      newHeight = box.width / aspectRatio;
      if (newHeight > maxHeight) {
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      }
    } else {
      newWidth = box.height * aspectRatio;
      if (newWidth > maxWidth) {
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
      }
    }
    
    // Ограничение коробки границами страницы
    const newX = Math.max(0, Math.min(box.x, maxWidth - newWidth));
    const newY = Math.max(0, Math.min(box.y, maxHeight - newHeight));
    
    return { x: newX, y: newY, width: newWidth, height: newHeight };
  }

  /**
   * Рассчитывает новую позицию при перетаскивании
   */
  calculateDragPosition(event: MouseEvent, dragState: DragState): { x: number; y: number } {
    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;
    
    return {
      x: dragState.originalX + dx,
      y: dragState.originalY + dy
    };
  }

  /**
   * Инициализирует состояние перетаскивания
   */
  initDragState(event: MouseEvent, x: number, y: number): DragState {
    return {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originalX: x,
      originalY: y
    };
  }

  /**
   * Проверяет, находится ли клик внутри элемента
   */
  isClickInsideElement(event: MouseEvent, element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  /**
   * Проверяет, находится ли клик внутри какого-либо элемента из набора
   */
  isClickInsideAnyElement(event: MouseEvent, elements: NodeListOf<Element>): boolean {
    let isInside = false;
    elements.forEach((element: Element) => {
      if (this.isClickInsideElement(event, element as HTMLElement)) {
        isInside = true;
      }
    });
    return isInside;
  }

  /**
   * Обновляет размеры бокса при рисовании аннотации
   */
  updateBoxDimensions(startX: number, startY: number, currentX: number, currentY: number): Box {
    const newX = Math.min(startX, currentX);
    const newY = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    
    return { x: newX, y: newY, width, height };
  }

  /**
   * Вычисляет пропорции предпросмотра изображения
   */
  calculatePreviewDimensions(originalWidth: number, originalHeight: number, maxPreviewSize: number): { width: number; height: number } {
    const ratio = originalWidth / originalHeight;
    
    if (ratio > 1) {
      // Landscape image
      return {
        width: maxPreviewSize,
        height: maxPreviewSize / ratio
      };
    } else {
      // Portrait image
      return {
        width: maxPreviewSize * ratio,
        height: maxPreviewSize
      };
    }
  }

  /**
   * Сбрасывает состояние перетаскивания
   */
  resetDragState(): DragState {
    return {
      isDragging: false,
      startX: 0,
      startY: 0,
      originalX: 0,
      originalY: 0
    };
  }
} 