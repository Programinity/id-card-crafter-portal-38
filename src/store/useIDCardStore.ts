
import { create } from 'zustand';

interface IDCardElement {
  id: string;
  type: 'field' | 'image';
  field?: any;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
}

interface IDCardStore {
  frontTemplate: string | null;
  backTemplate: string | null;
  frontElements: IDCardElement[];
  backElements: IDCardElement[];
  
  setFrontTemplate: (template: string) => void;
  setBackTemplate: (template: string) => void;
  addElement: (side: 'front' | 'back', element: IDCardElement) => void;
  updateElement: (side: 'front' | 'back', elementId: string, updates: Partial<IDCardElement>) => void;
  removeElement: (side: 'front' | 'back', elementId: string) => void;
  saveTemplate: () => void;
  exportCard: (student: any) => void;
}

export const useIDCardStore = create<IDCardStore>((set, get) => ({
  frontTemplate: null,
  backTemplate: null,
  frontElements: [],
  backElements: [],

  setFrontTemplate: (template) => set({ frontTemplate: template }),
  setBackTemplate: (template) => set({ backTemplate: template }),

  addElement: (side, element) => set((state) => ({
    [`${side}Elements`]: [...state[`${side}Elements` as keyof typeof state] as IDCardElement[], element]
  })),

  updateElement: (side, elementId, updates) => set((state) => ({
    [`${side}Elements`]: (state[`${side}Elements` as keyof typeof state] as IDCardElement[]).map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    )
  })),

  removeElement: (side, elementId) => set((state) => ({
    [`${side}Elements`]: (state[`${side}Elements` as keyof typeof state] as IDCardElement[]).filter(el => el.id !== elementId)
  })),

  saveTemplate: () => {
    const { frontTemplate, backTemplate, frontElements, backElements } = get();
    const template = {
      frontTemplate,
      backTemplate,
      frontElements,
      backElements,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('idCardTemplate', JSON.stringify(template));
    console.log('Template saved to localStorage:', template);
  },

  exportCard: (student) => {
    const { frontTemplate, backTemplate, frontElements, backElements } = get();
    const cardData = {
      student,
      frontTemplate,
      backTemplate,
      frontElements,
      backElements,
      exportedAt: new Date().toISOString()
    };
    console.log('Exporting card data:', cardData);
    // In a real implementation, this would generate and download the ID card
  }
}));
