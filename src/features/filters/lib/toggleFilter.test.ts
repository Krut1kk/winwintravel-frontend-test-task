import { describe, expect, it } from 'vitest'

import { FilterItem, FilterType } from '@/shared/api/types/Filter'
import { SearchRequestFilter } from '@/shared/api/types/SearchRequest/SearchRequestFilter'
import filterData from '@/shared/temp/filterData.json'

import { toggleFilter } from './toggleFilter'

const filterItems = filterData.filterItems as FilterItem[]

describe('toggleFilter', () => {
	it('adds the first option to an empty selection', () => {
		expect(toggleFilter(filterItems, [], 'MEAL_OPTIONS', 'lunch')).toEqual([
			{ id: 'MEAL_OPTIONS', type: FilterType.OPTION, optionsIds: ['lunch'] }
		])
	})

	it('keeps JSON order for groups and options when adding several values', () => {
		let selected: SearchRequestFilter = []
		selected = toggleFilter(filterItems, selected, 'BED_TYPE', 'double-bed')
		selected = toggleFilter(filterItems, selected, 'MEAL_OPTIONS', 'dinner')
		selected = toggleFilter(filterItems, selected, 'MEAL_OPTIONS', 'breakfast')
		selected = toggleFilter(filterItems, selected, 'BED_TYPE', 'twin-beds')

		expect(selected).toEqual([
			{
				id: 'MEAL_OPTIONS',
				type: FilterType.OPTION,
				optionsIds: ['breakfast', 'dinner']
			},
			{
				id: 'BED_TYPE',
				type: FilterType.OPTION,
				optionsIds: ['twin-beds', 'double-bed']
			}
		])
	})

	it('removes an already selected option', () => {
		const selected: SearchRequestFilter = [
			{
				id: 'FACILITIES',
				type: FilterType.OPTION,
				optionsIds: ['heating', 'wi-fi', 'pool']
			}
		]

		expect(toggleFilter(filterItems, selected, 'FACILITIES', 'wi-fi')).toEqual([
			{
				id: 'FACILITIES',
				type: FilterType.OPTION,
				optionsIds: ['heating', 'pool']
			}
		])
	})

	it('drops the group when its last option is removed', () => {
		const selected: SearchRequestFilter = [
			{ id: 'MEAL_OPTIONS', type: FilterType.OPTION, optionsIds: ['lunch'] },
			{ id: 'BED_TYPE', type: FilterType.OPTION, optionsIds: ['twin-beds'] }
		]

		expect(
			toggleFilter(filterItems, selected, 'MEAL_OPTIONS', 'lunch')
		).toEqual([
			{ id: 'BED_TYPE', type: FilterType.OPTION, optionsIds: ['twin-beds'] }
		])
	})

	it('does not mutate the source selection', () => {
		const selected: SearchRequestFilter = [
			{ id: 'MEAL_OPTIONS', type: FilterType.OPTION, optionsIds: ['lunch'] }
		]
		const snapshot = structuredClone(selected)

		const result = toggleFilter(filterItems, selected, 'MEAL_OPTIONS', 'dinner')

		expect(selected).toEqual(snapshot)
		expect(result).not.toBe(selected)
		expect(result[0].optionsIds).not.toBe(selected[0].optionsIds)
	})

	it('returns groups in SearchRequestFilter format only', () => {
		const result = toggleFilter(
			filterItems,
			[],
			'HEALTH_ENTERTAINMENT_SPORTS',
			'spa'
		)

		expect(result).toHaveLength(1)
		expect(Object.keys(result[0]).sort()).toEqual(['id', 'optionsIds', 'type'])
		expect(result[0].type).toBe(FilterType.OPTION)
	})
})
