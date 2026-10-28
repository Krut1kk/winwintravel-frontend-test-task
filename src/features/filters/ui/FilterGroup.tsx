import { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import { FilterItem } from '@/shared/api/types/Filter'
import { SearchRequestFilter } from '@/shared/api/types/SearchRequest/SearchRequestFilter'
import CheckIcon from '@/shared/assets/icons/check.svg'

interface FilterGroupProps {
	filterItem: FilterItem
	selected: SearchRequestFilter
	onToggle: (optionId: string) => void
}

export const FilterGroup = ({
	filterItem,
	selected,
	onToggle
}: FilterGroupProps) => {
	const { t } = useTranslation('filterData')
	const selectedIds =
		selected.find(group => group.id === filterItem.id)?.optionsIds ?? []
	const optionsCount = filterItem.options.length

	const rowsStyle = {
		'--rows-md': `repeat(${Math.ceil(optionsCount / 2)}, auto)`,
		'--rows-lg': `repeat(${Math.ceil(optionsCount / 3)}, auto)`
	} as CSSProperties

	return (
		<fieldset className="py-6 md:py-8">
			<legend className="float-left mb-6 w-full text-2xl leading-[normal] font-medium">
				{t(`${filterItem.id}.name`, { defaultValue: filterItem.name })}
			</legend>
			<div
				className="clear-left grid gap-x-8 gap-y-4 md:grid-flow-col md:grid-cols-2 md:grid-rows-(--rows-md) lg:grid-cols-3 lg:grid-rows-(--rows-lg)"
				style={rowsStyle}
			>
				{filterItem.options.map(option => (
					<label
						key={option.id}
						className="flex cursor-pointer items-center gap-4 text-base leading-[normal]"
					>
						<span className="relative flex size-6 shrink-0 items-center justify-center">
							<input
								type="checkbox"
								className="peer size-5 cursor-pointer appearance-none rounded-[3px] border-2 border-grey-500 bg-white checked:bg-grey-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
								checked={selectedIds.includes(option.id)}
								onChange={() => onToggle(option.id)}
							/>
							<CheckIcon className="pointer-events-none absolute hidden text-white peer-checked:block" />
						</span>
						{t(`${filterItem.id}.options.${option.id}`, {
							defaultValue: option.name
						})}
					</label>
				))}
			</div>
		</fieldset>
	)
}
