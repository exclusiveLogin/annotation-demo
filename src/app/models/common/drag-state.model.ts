/**
 * Состояние перетаскивания элемента
 */
export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  originalX: number;
  originalY: number;
} 