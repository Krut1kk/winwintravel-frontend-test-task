import {
	FormEvent,
	MouseEvent,
	useEffect,
	useId,
	useRef,
	useState
} from 'react'
import { useTranslation } from 'react-i18next'

import CloseIcon from '@/shared/assets/icons/close.svg'

import { useFiltersQuery } from '../api/useFiltersQuery'
import { toggleFilter } from '../lib/toggleFilter'
import { useFilterStore } from '../model/useFilterStore'
import { ConfirmModal } from './ConfirmModal'
import { FilterGroup } from './FilterGroup'

interface FilterModalProps {
	onClose: () => void
}

export const FilterModal = ({ onClose }: FilterModalProps) => {
	const { t } = useTranslation()
	const titleId = useId()
	const dialogRef = useRef<HTMLDialogElement>(null)
	const { data: filterItems } = useFiltersQuery()
	const setAppliedFilter = useFilterStore(state => state.setAppliedFilter)
	const [draft, setDraft] = useState(useFilterStore.getState().appliedFilter)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)

	useEffect(() => {
		const dialog = dialogRef.current
		if (dialog && !dialog.open) {
			dialog.showModal()
		}
	}, [])

	// close() instead of unmounting lets the browser restore focus
	const closeFilter = () => dialogRef.current?.close()

	// Only backdrop presses target the dialog itself; mousedown ignores
	// text selections that end outside
	const handleBackdropMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
		if (event.target === event.currentTarget) {
			closeFilter()
		}
	}

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault()
		setIsConfirmOpen(true)
	}

	const handleConfirm = () => {
		setAppliedFilter(draft)
		closeFilter()
	}

	return (
		<>
			<dialog
				ref={dialogRef}
				aria-labelledby={titleId}
				onClose={onClose}
				onMouseDown={handleBackdropMouseDown}
				className="m-auto max-h-none w-[calc(100%-2rem)] max-w-[1280px] overflow-hidden rounded-2xl bg-white text-grey-500 backdrop:bg-[rgba(27,27,27,0.3)] backdrop:backdrop-blur-[12.5px]"
			>
				<div className="max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain px-4 pt-6 pb-6 md:max-h-[calc(100dvh-160px)] md:px-8 md:pt-10 md:pb-10">
					<header className="relative flex min-h-12 items-center justify-center border-b-2 border-grey-200 pb-6">
						<h2
							id={titleId}
							className="text-2xl leading-[normal] font-medium md:text-[40px]"
						>
							{t('title')}
						</h2>
						<button
							type="button"
							aria-label={t('close')}
							onClick={closeFilter}
							className="absolute top-3 right-0 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
						>
							<CloseIcon />
						</button>
					</header>
					<form onSubmit={handleSubmit}>
						<div className="divide-y-2 divide-grey-200 border-b-2 border-grey-200">
							{filterItems.map(filterItem => (
								<FilterGroup
									key={filterItem.id}
									filterItem={filterItem}
									selected={draft}
									onToggle={optionId =>
										setDraft(
											toggleFilter(filterItems, draft, filterItem.id, optionId)
										)
									}
								/>
							))}
						</div>
						<div className="relative mt-6 flex flex-col items-center gap-4 md:mt-8">
							<button
								type="submit"
								className="flex h-16 w-46 cursor-pointer items-center justify-center rounded-2xl bg-brand-200 text-base font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-500"
							>
								{t('apply')}
							</button>
							<button
								type="button"
								onClick={() => setDraft([])}
								className="cursor-pointer rounded text-base leading-[normal] font-medium text-primary-100 underline decoration-from-font [text-decoration-skip-ink:none] [text-underline-position:from-font] hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-100 md:absolute md:top-1/2 md:right-0 md:-translate-y-1/2"
							>
								{t('clear')}
							</button>
						</div>
					</form>
				</div>
			</dialog>
			{/* Not nested: React would pass its close event to the parent onClose */}
			{isConfirmOpen && (
				<ConfirmModal
					onConfirm={handleConfirm}
					onReject={closeFilter}
					onClose={() => setIsConfirmOpen(false)}
				/>
			)}
		</>
	)
}
