import { FilterItem, FilterType } from '@/shared/api/types/Filter'
import { SearchRequestFilter } from '@/shared/api/types/SearchRequest/SearchRequestFilter'

export const toggleFilter = (
	filterItems: FilterItem[],
	selected: SearchRequestFilter,
	filterId: string,
	optionId: string
): SearchRequestFilter =>
	filterItems.flatMap(filterItem => {
		const selectedIds =
			selected.find(group => group.id === filterItem.id)?.optionsIds ?? []

		const optionsIds = filterItem.options
			.map(option => option.id)
			.filter(id => {
				const isSelected = selectedIds.includes(id)
				const isToggled = filterItem.id === filterId && id === optionId

				return isToggled ? !isSelected : isSelected
			})

		return optionsIds.length > 0
			? [{ id: filterItem.id, type: FilterType.OPTION, optionsIds }]
			: []
	})
