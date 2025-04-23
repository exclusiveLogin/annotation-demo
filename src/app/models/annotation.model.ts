export interface Annotation {
  id: string;
  type: 'text' | 'highlight' | 'comment';
  content: string;
  position: {
    x: number;
    y: number;
  };
  page: number;
  createdAt: string;
  updatedAt: string;
}

export const annotationSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    type: { 
      type: 'string',
      enum: ['text', 'highlight', 'comment']
    },
    content: { type: 'string' },
    position: {
      type: 'object',
      properties: {
        x: { type: 'number' },
        y: { type: 'number' }
      },
      required: ['x', 'y']
    },
    page: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' }
  },
  required: ['id', 'type', 'content', 'position', 'page', 'createdAt', 'updatedAt']
}; 