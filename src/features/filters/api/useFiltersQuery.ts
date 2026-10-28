import { useQuery } from '@tanstack/react-query'

import { FilterItem } from '@/shared/api/types/Filter'
import filterData from '@/shared/temp/filterData.json'

const filterItems = filterData.filterItems as FilterItem[]

const getFilters = async () => filterItems

export const useFiltersQuery = () =>
	useQuery({
		queryKey: ['filters'],
		queryFn: getFilters,
		initialData: filterItems,
		staleTime: Infinity
	})
