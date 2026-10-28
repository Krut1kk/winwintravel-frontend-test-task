import { MouseEvent, useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import CloseIcon from '@/shared/assets/icons/close.svg'

interface ConfirmModalProps {
	onConfirm: () => void
	onReject: () => void
	onClose: () => void
}

export const ConfirmModal = ({
	onConfirm,
	onReject,
	onClose
}: ConfirmModalProps) => {
	const { t } = useTranslation()
	const titleId = useId()
	const dialogRef = useRef<HTMLDialogElement>(null)

	useEffect(() => {
		const dialog = dialogRef.current
		if (dialog && !dialog.open) {
			dialog.showModal()
		}
	}, [])

	const closeWith = (callback: () => void) => {
		dialogRef.current?.close()
		callback()
	}

	const handleBackdropMouseDown = (event: MouseEvent<HTMLDialogElement>) => {
		if (event.target === event.currentTarget) {
			dialogRef.current?.close()
		}
	}

	return (
		<dialog
			ref={dialogRef}
			aria-labelledby={titleId}
			onClose={onClose}
			onMouseDown={handleBackdropMouseDown}
			className="m-auto w-[calc(100%-2rem)] max-w-[1280px] rounded-2xl bg-white text-grey-500 shadow-[0_2px_12px_rgba(0,0,0,0.14)] backdrop:bg-[rgba(27,27,27,0.3)] backdrop:backdrop-blur-[12.5px] lg:mt-[max(1rem,min(280px,calc(100dvh-312px)))]"
		>
			<div className="p-4 md:p-8">
				<header className="relative flex min-h-12 items-center justify-center px-8">
					<h2
						id={titleId}
						className="text-center text-2xl leading-[normal] font-medium md:text-[40px]"
					>
						{t('confirm.title')}
					</h2>
					<button
						type="button"
						aria-label={t('close')}
						onClick={() => dialogRef.current?.close()}
						className="absolute top-3 right-0 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200"
					>
						<CloseIcon />
					</button>
				</header>
				<div className="mt-8 flex flex-col items-center justify-center gap-4 md:mt-[120px] md:flex-row md:gap-8">
					<button
						type="button"
						onClick={() => closeWith(onReject)}
						className="h-16 w-full cursor-pointer rounded-2xl border-2 border-grey-200 bg-white text-base font-semibold text-grey-400 hover:bg-grey-200/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-200 md:w-70"
					>
						{t('confirm.cancel')}
					</button>
					<button
						type="button"
						onClick={() => closeWith(onConfirm)}
						className="h-16 w-full cursor-pointer rounded-2xl bg-brand-200 text-base font-semibold text-white hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-grey-500 md:w-70"
					>
						{t('confirm.apply')}
					</button>
				</div>
			</div>
		</dialog>
	)
}
