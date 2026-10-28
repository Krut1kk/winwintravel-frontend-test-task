import { act } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, within } from '@testing-library/react'
import i18n from 'i18next'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { useFilterStore } from '@/features/filters'
import { FilterType } from '@/shared/api/types/Filter'
import { SearchRequestFilter } from '@/shared/api/types/SearchRequest/SearchRequestFilter'
import '@/shared/i18n'
import filterData from '@/shared/temp/filterData.json'

import { App } from './App'

const FILTER_TITLE = 'Filter'
const CONFIRM_TITLE = 'Do you want to apply new filter'

const renderApp = (queryClient = new QueryClient()) =>
	render(
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	)

const openFilter = () => {
	fireEvent.click(screen.getByRole('button', { name: 'Open filters' }))
	return screen.findByRole('dialog', { name: FILTER_TITLE })
}

const clickInDialog = (dialogName: string, buttonName: string) =>
	fireEvent.click(
		within(screen.getByRole('dialog', { name: dialogName })).getByRole(
			'button',
			{ name: buttonName }
		)
	)

const toggleOption = (filterDialog: HTMLElement, optionName: string) =>
	fireEvent.click(
		within(filterDialog).getByRole('checkbox', { name: optionName })
	)

const appliedFilter = () => useFilterStore.getState().appliedFilter

const initialFilter: SearchRequestFilter = [
	{ id: 'BED_TYPE', type: FilterType.OPTION, optionsIds: ['twin-beds'] }
]

// jsdom does not implement the native dialog methods
beforeAll(() => {
	HTMLDialogElement.prototype.showModal = function () {
		this.open = true
	}
	HTMLDialogElement.prototype.close = function () {
		this.open = false
		this.dispatchEvent(new Event('close'))
	}
})

beforeEach(async () => {
	useFilterStore.setState({ appliedFilter: [] })
	await i18n.changeLanguage('en')
})

describe('filter flow', () => {
	it('saves the draft after "Apply new filter"', async () => {
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Pool')
		toggleOption(filterDialog, 'Lunch included')
		expect(appliedFilter()).toEqual([])

		clickInDialog(FILTER_TITLE, 'Apply')
		expect(appliedFilter()).toEqual([])

		clickInDialog(CONFIRM_TITLE, 'Apply new filter')

		const expected: SearchRequestFilter = [
			{ id: 'MEAL_OPTIONS', type: FilterType.OPTION, optionsIds: ['lunch'] },
			{ id: 'FACILITIES', type: FilterType.OPTION, optionsIds: ['pool'] }
		]
		expect(appliedFilter()).toEqual(expected)
		expect(screen.queryByRole('dialog')).toBeNull()
		expect(document.querySelector('pre')).toHaveTextContent(
			JSON.stringify(expected, null, 2),
			{ normalizeWhitespace: false }
		)
	})

	it('keeps the old filter after "Use old filter"', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Lunch included')
		clickInDialog(FILTER_TITLE, 'Apply')
		clickInDialog(CONFIRM_TITLE, 'Use old filter')

		expect(appliedFilter()).toBe(initialFilter)
		expect(screen.queryByRole('dialog')).toBeNull()
	})

	it('returns to the filter with the draft when the confirmation is closed', async () => {
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Lunch included')
		clickInDialog(FILTER_TITLE, 'Apply')
		clickInDialog(CONFIRM_TITLE, 'Close')

		expect(screen.queryByRole('dialog', { name: CONFIRM_TITLE })).toBeNull()
		expect(screen.getByRole('dialog', { name: FILTER_TITLE })).toBe(
			filterDialog
		)
		expect(
			within(filterDialog).getByRole('checkbox', { name: 'Lunch included' })
		).toBeChecked()
		expect(appliedFilter()).toEqual([])
	})

	it('shows the applied selection when the filter is opened again', async () => {
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Spa')
		clickInDialog(FILTER_TITLE, 'Apply')
		clickInDialog(CONFIRM_TITLE, 'Apply new filter')

		const reopenedDialog = await openFilter()
		expect(
			within(reopenedDialog).getByRole('checkbox', { name: 'Spa' })
		).toBeChecked()
		expect(
			within(reopenedDialog).getAllByRole('checkbox', { checked: true })
		).toHaveLength(1)
	})

	it('discards changes when the filter is closed without applying', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Lunch included')
		toggleOption(filterDialog, 'Twin beds')
		clickInDialog(FILTER_TITLE, 'Close')

		expect(screen.queryByRole('dialog')).toBeNull()
		expect(appliedFilter()).toBe(initialFilter)

		const reopenedDialog = await openFilter()
		expect(
			within(reopenedDialog).getByRole('checkbox', { name: 'Twin beds' })
		).toBeChecked()
		expect(
			within(reopenedDialog).getByRole('checkbox', { name: 'Lunch included' })
		).not.toBeChecked()
	})
})

describe('home', () => {
	it('shows the empty state while no filter is applied', () => {
		renderApp()

		expect(
			screen.getByRole('heading', { name: 'No filters selected yet' })
		).toBeInTheDocument()
		expect(
			screen.getByText('Choose your preferences to customize the search.')
		).toBeInTheDocument()
		expect(document.querySelector('pre')).toBeNull()
	})

	it('replaces the empty state with JSON after applying filters', async () => {
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Gym')
		clickInDialog(FILTER_TITLE, 'Apply')
		clickInDialog(CONFIRM_TITLE, 'Apply new filter')

		expect(
			screen.queryByRole('heading', { name: 'No filters selected yet' })
		).toBeNull()
		expect(document.querySelector('pre')).toHaveTextContent(
			JSON.stringify(appliedFilter(), null, 2),
			{ normalizeWhitespace: false }
		)
	})

	it('switches the interface language', () => {
		renderApp()

		fireEvent.click(screen.getByRole('button', { name: 'UA' }))

		expect(screen.getByRole('button', { name: 'UA' })).toHaveAttribute(
			'aria-pressed',
			'true'
		)
		expect(
			screen.getByRole('button', { name: 'Відкрити фільтри' })
		).toBeInTheDocument()
		expect(
			screen.getByRole('heading', { name: 'Фільтри ще не вибрано' })
		).toBeInTheDocument()
		expect(document.documentElement.lang).toBe('uk')

		fireEvent.click(screen.getByRole('button', { name: 'EN' }))

		expect(
			screen.getByRole('button', { name: 'Open filters' })
		).toBeInTheDocument()
	})
})

describe('clear all parameters', () => {
	it('unchecks every option in the draft only', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Lunch included')
		clickInDialog(FILTER_TITLE, 'Clear all parameters')

		expect(
			within(filterDialog).queryAllByRole('checkbox', { checked: true })
		).toHaveLength(0)
		expect(appliedFilter()).toBe(initialFilter)
	})

	it('keeps the applied filter when closed without confirmation', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		renderApp()
		await openFilter()

		clickInDialog(FILTER_TITLE, 'Clear all parameters')
		clickInDialog(FILTER_TITLE, 'Close')

		expect(appliedFilter()).toBe(initialFilter)
	})

	it('saves an empty filter after confirmation', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		renderApp()
		await openFilter()

		clickInDialog(FILTER_TITLE, 'Clear all parameters')
		clickInDialog(FILTER_TITLE, 'Apply')
		clickInDialog(CONFIRM_TITLE, 'Apply new filter')

		expect(appliedFilter()).toEqual([])
		expect(
			screen.getByRole('heading', { name: 'No filters selected yet' })
		).toBeInTheDocument()
	})
})

describe('filter data localization', () => {
	const groupNames = (filterDialog: HTMLElement) =>
		within(filterDialog)
			.getAllByRole('group')
			.map(group => group.querySelector('legend')?.textContent)

	const optionNames = (filterDialog: HTMLElement) =>
		within(filterDialog)
			.getAllByRole('checkbox')
			.map(checkbox => checkbox.closest('label')?.textContent)

	it('shows the original API names in English', async () => {
		renderApp()
		const filterDialog = await openFilter()

		expect(groupNames(filterDialog)).toEqual(
			filterData.filterItems.map(filterItem => filterItem.name)
		)
		expect(optionNames(filterDialog)).toEqual(
			filterData.filterItems.flatMap(filterItem =>
				filterItem.options.map(option => option.name)
			)
		)
	})

	it('translates all 5 groups into Ukrainian', async () => {
		renderApp()
		fireEvent.click(screen.getByRole('button', { name: 'UA' }))
		fireEvent.click(screen.getByRole('button', { name: 'Відкрити фільтри' }))
		const filterDialog = await screen.findByRole('dialog', { name: 'Фільтр' })

		expect(groupNames(filterDialog)).toEqual([
			'Варіанти харчування',
			'Правила, умови та оплата',
			'Зручності',
			'Тип ліжка',
			"Здоров'я, розваги та спорт"
		])
	})

	it('translates all 20 options into Ukrainian', async () => {
		renderApp()
		fireEvent.click(screen.getByRole('button', { name: 'UA' }))
		fireEvent.click(screen.getByRole('button', { name: 'Відкрити фільтри' }))
		const filterDialog = await screen.findByRole('dialog', { name: 'Фільтр' })

		expect(optionNames(filterDialog)).toEqual([
			'Сніданок включено',
			'Обід включено',
			'Вечеря включена',
			'Все включено',
			'Безкоштовне скасування',
			'Можна з тваринами',
			'Номер для некурців',
			'Окрема ванна кімната',
			'Кондиціонер',
			'Опалення',
			'Кавоварка/чайник',
			'Трансфер',
			'Wi-Fi',
			'Парковка',
			'Басейн',
			'Два окремих ліжка',
			'Двоспальне ліжко',
			'Тренажерний зал',
			'Спа',
			'Сауна'
		])
	})

	it('keeps the draft, the store and the loaded data when the language changes', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		const queryClient = new QueryClient()
		renderApp(queryClient)
		const filterDialog = await openFilter()
		const queryState = queryClient.getQueryState(['filters'])

		toggleOption(filterDialog, 'Lunch included')
		await act(() => i18n.changeLanguage('uk'))

		expect(
			within(filterDialog).getByRole('checkbox', { name: 'Обід включено' })
		).toBeChecked()
		expect(
			within(filterDialog).getByRole('checkbox', { name: 'Два окремих ліжка' })
		).toBeChecked()
		expect(
			within(filterDialog).getAllByRole('checkbox', { checked: true })
		).toHaveLength(2)
		expect(appliedFilter()).toBe(initialFilter)
		expect(queryClient.getQueryState(['filters'])).toBe(queryState)
	})

	it('saves original ids when applied in Ukrainian', async () => {
		renderApp()
		fireEvent.click(screen.getByRole('button', { name: 'UA' }))
		fireEvent.click(screen.getByRole('button', { name: 'Відкрити фільтри' }))
		const filterDialog = await screen.findByRole('dialog', { name: 'Фільтр' })

		toggleOption(filterDialog, 'Сауна')
		toggleOption(filterDialog, 'Сніданок включено')
		clickInDialog('Фільтр', 'Застосувати')
		clickInDialog(
			'Бажаєте застосувати новий фільтр',
			'Застосувати новий фільтр'
		)

		expect(appliedFilter()).toEqual([
			{
				id: 'MEAL_OPTIONS',
				type: FilterType.OPTION,
				optionsIds: ['breakfast']
			},
			{
				id: 'HEALTH_ENTERTAINMENT_SPORTS',
				type: FilterType.OPTION,
				optionsIds: ['sauna']
			}
		])
	})
})

describe('backdrop', () => {
	it('closes the filter without saving, but not on a press inside', async () => {
		useFilterStore.setState({ appliedFilter: initialFilter })
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Lunch included')
		fireEvent.mouseDown(within(filterDialog).getByText('Meal options'))
		expect(screen.getByRole('dialog', { name: FILTER_TITLE })).toBeVisible()

		fireEvent.mouseDown(filterDialog)

		expect(screen.queryByRole('dialog')).toBeNull()
		expect(appliedFilter()).toBe(initialFilter)
	})

	it('closes only the confirmation and keeps the draft', async () => {
		renderApp()
		const filterDialog = await openFilter()

		toggleOption(filterDialog, 'Lunch included')
		clickInDialog(FILTER_TITLE, 'Apply')
		const confirmDialog = screen.getByRole('dialog', { name: CONFIRM_TITLE })

		fireEvent.mouseDown(within(confirmDialog).getByText(CONFIRM_TITLE))
		expect(screen.getByRole('dialog', { name: CONFIRM_TITLE })).toBeVisible()

		fireEvent.mouseDown(confirmDialog)

		expect(screen.queryByRole('dialog', { name: CONFIRM_TITLE })).toBeNull()
		expect(screen.getByRole('dialog', { name: FILTER_TITLE })).toBe(
			filterDialog
		)
		expect(
			within(filterDialog).getByRole('checkbox', { name: 'Lunch included' })
		).toBeChecked()
		expect(appliedFilter()).toEqual([])
	})
})
