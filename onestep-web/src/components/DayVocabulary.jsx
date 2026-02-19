import { useMemo, useState } from 'react'
import dataXml from '../Database/data.xml?raw'

const imageImports = import.meta.glob('../Database/Images/*.png', {
  eager: true,
  import: 'default',
})

const normalizeXml = (xml) => xml.replace(/^\s*sentences>/gm, '<sentences>')

const parseVocabulary = (xml) => {
  const parser = new DOMParser()
  const document = parser.parseFromString(normalizeXml(xml), 'text/xml')
  if (document.getElementsByTagName('parsererror').length > 0) {
    return []
  }

  return Array.from(document.getElementsByTagName('entry')).map((entry) => ({
    day: entry.getElementsByTagName('day')[0]?.textContent?.trim(),
    id: entry.getElementsByTagName('id')[0]?.textContent?.trim(),
    word: entry.getElementsByTagName('word')[0]?.textContent?.trim(),
    partOfSpeech: entry.getElementsByTagName('partOfSpeech')[0]?.textContent?.trim(),
    meaning: entry.getElementsByTagName('meaning')[0]?.textContent?.trim(),
    synonym: entry.getElementsByTagName('synonym')[0]?.textContent?.trim(),
    sentences: Array.from(entry.getElementsByTagName('sentence')).map((node) =>
      node.textContent?.trim()
    ),
  }))
}

const buildImageMap = () =>
  Object.fromEntries(
    Object.entries(imageImports).map(([path, url]) => {
      const match = path.match(/(\d+)\.png$/)
      return [match?.[1], url]
    })
  )

const DayVocabulary = ({ day, onBack }) => {
  const items = useMemo(() => parseVocabulary(dataXml), [])
  const imageById = useMemo(() => buildImageMap(), [])
  const dayItems = items.filter((entry) => entry.day === String(day))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealStep, setRevealStep] = useState(0)


  if (dayItems.length === 0) {
    return (
      <div className="mt-8 text-center text-lg font-semibold">
        No vocabulary found for Day-{day}.
      </div>
    )
  }

  const entry = dayItems[currentIndex]
  const imageUrl = entry ? imageById[entry.id] : null
  const showImage = revealStep >= 1
  const showDetails = revealStep >= 2

  const isPrevDisabled = currentIndex === 0 && revealStep === 0
  const isNextDisabled =
    currentIndex === dayItems.length - 1 && revealStep === 2

  const handlePrev = () => {
    if (revealStep > 0) {
      setRevealStep((step) => step - 1)
      return
    }
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1)
      setRevealStep(2)
    }
  }

  const handleNext = () => {
    if (revealStep < 2) {
      setRevealStep((step) => step + 1)
      return
    }
    if (currentIndex < dayItems.length - 1) {
      setCurrentIndex((index) => index + 1)
      setRevealStep(0)
    }
  }

  return (
    <section className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-2xl font-extrabold">Day-{String(day).padStart(2, '0')}</div>
        <div className="text-lg font-semibold">
          Word {currentIndex + 1} / {dayItems.length}
        </div>
      </div>
      <div className="flex flex-col gap-5 border-4 border-black bg-white px-6 py-5 shadow-[0_6px_0_#000000]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded border-2 border-black bg-black px-3 py-1 text-lg font-extrabold text-white">
            No. {entry.id}
          </div>
          <div className="text-3xl font-extrabold">{entry.word}</div>
          <div className="text-lg font-semibold uppercase text-[#444444]">
            {entry.partOfSpeech}
          </div>
        </div>

        {showImage && (
          <div className="flex items-center gap-4">
            {imageUrl ? (
              <img
                className="h-28 w-28 rounded border-2 border-black object-cover"
                src={imageUrl}
                alt={entry.word}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded border-2 border-black bg-[#f2f0ee] text-sm font-semibold">
                No Image
              </div>
            )}
          </div>
        )}

        {showDetails && (
          <div className="flex flex-col gap-3">
            <div className="text-lg font-semibold">{entry.meaning}</div>
            <div className="text-base font-semibold text-[#444444]">
              {entry.synonym}
            </div>
            <ul className="list-disc space-y-2 pl-6 text-base font-semibold">
              {entry.sentences.map((sentence, index) => (
                <li key={`${entry.id}-${index}`}>{sentence}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-black bg-white px-4 py-2 text-base font-extrabold"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className="border-2 border-black bg-black px-4 py-2 text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled}
            className="border-2 border-black bg-black px-4 py-2 text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default DayVocabulary
