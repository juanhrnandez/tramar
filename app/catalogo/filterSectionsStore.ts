import { create } from "zustand";
import { persist } from "zustand/middleware";

type FilterSectionsState = {
  sections: Record<string, boolean>;
  setSection: (id: string, open: boolean) => void;
  toggle: (id: string, defaultOpen?: boolean) => void;
  isOpen: (id: string, defaultOpen?: boolean) => boolean;
};

export const useFilterSections = create<FilterSectionsState>()(
  persist(
    (set, get) => ({
      sections: {},
      setSection: (id, open) =>
        set((s) => ({ sections: { ...s.sections, [id]: open } })),
      toggle: (id, defaultOpen = false) => {
        const current = get().isOpen(id, defaultOpen);
        set((s) => ({ sections: { ...s.sections, [id]: !current } }));
      },
      isOpen: (id, defaultOpen = false) => {
        const { sections } = get();
        return id in sections ? sections[id] : defaultOpen;
      },
    }),
    { name: "tramar-filter-sections" }
  )
);
