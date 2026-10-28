import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FilterModal, useFilterStore } from '@/features/filters'
import { I18N_LANGUAGES } from '@/shared/i18n/i18nConstants'

export const App = () => {
	const { t, i18n } = useTranslation()
	const appliedFilter = useFilterStore(state => state.appliedFilter)
	const [isFilterOpen, setIsFilterOpen] = useState(false)

	return (
		<main className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 p-4 pt-20">
			<div
				role="group"
				aria-label={t('language')}
				className="absolute top-4 right-4 flex gap-2"
			>
				{I18N_LANGUAGES.map(language => (
					<button
						key={language.code}
						type="button"
						aria-pressed={i18n.resolvedLanguage === language.code}
						onClick={() => i18n.changeLanguage(language.code)}
						className="cursor-pointer rounded-lg border-2 border-grey-500 px-3 py-1 text-sm font-semibold text-grey-500 aria-pressed:bg-grey-500 aria-pressed:text-white"
					>
						{language.label}
					</button>
				))}
			</div>
			<h1 className="text-center text-6xl text-gray-600">{t('home.title')}</h1>
			<button
				type="button"
				onClick={() => setIsFilterOpen(true)}
				className="cursor-pointer rounded-2xl bg-brand-200 px-8 py-4 font-semibold text-white"
			>
				{t('open')}
			</button>
			{appliedFilter.length === 0 ? (
				<section className="text-center text-grey-500">
					<h2 className="text-2xl font-medium">{t('empty.title')}</h2>
					<p className="mt-2 text-base text-gray-600">
						{t('empty.description')}
					</p>
				</section>
			) : (
				<pre className="w-full max-w-3xl overflow-x-auto rounded-lg bg-gray-100 p-4 text-sm">
					{JSON.stringify(appliedFilter, null, 2)}
				</pre>
			)}
			{isFilterOpen && <FilterModal onClose={() => setIsFilterOpen(false)} />}
		</main>
	)
}
