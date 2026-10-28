import filter from './filter.json'
import filterData from './filterData.json'
import notFound from './not-found.json'

export const en = {
	filter: filter,
	// Empty on purpose: in English the names come straight from the API
	filterData: filterData,
	'not-found': notFound
} as const
