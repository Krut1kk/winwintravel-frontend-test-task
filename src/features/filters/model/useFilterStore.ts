import { create } from 'zustand'

import { SearchRequestFilter } from '@/shared/api/types/SearchRequest/SearchRequestFilter'

interface FilterState {
	appliedFilter: SearchRequestFilter
	setAppliedFilter: (appliedFilter: SearchRequestFilter) => void
}

export const useFilterStore = create<FilterState>()(set => ({
	appliedFilter: [],
	setAppliedFilter: appliedFilter => set({ appliedFilter })
}))
