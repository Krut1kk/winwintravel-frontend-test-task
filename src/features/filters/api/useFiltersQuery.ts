import { useQuery } from '@tanstack/react-query'

import { FilterItem } from '@/shared/api/types/Filter'
import filterData from '@/shared/temp/filterData.json'

// There is no real endpoint in the task, so the local JSON plays the API role
const getFilters = async () => filterData.filterItems as FilterItem[]

export const useFiltersQuery = () =>
	useQuery({ queryKey: ['filters'], queryFn: getFilters })
