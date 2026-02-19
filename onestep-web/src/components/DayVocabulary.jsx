import { useMemo } from 'react'
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

const DayVocabulary = ({ day }) => {
  const items = useMemo(() => parseVocabulary(dataXml), [])
  const imageById = useMemo(() => buildImageMap(), [])
  const dayItems = items.filter((entry) => entry.day === String(day))

  if (dayItems.length === 0) {
    return (
      <div className="mt-8 text-center text-lg font-semibold">
        No vocabulary found for Day-{day}.
      </div>
    )
  }

  return (
    <section className="mx-auto mt-10 flex w-full max-w-4xl flex-col gap-6 px-6 pb-10">
      {dayItems.map((entry) => (
        <div
          key={entry.id}
          className="flex flex-col gap-4 border-4 border-black bg-white px-6 py-5 shadow-[0_6px_0_#000000]"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-3xl font-extrabold">{entry.word}</div>
            <div className="text-lg font-semibold uppercase text-[#444444]">
              {entry.partOfSpeech}
            </div>
          </div>
          <div className="text-lg font-semibold">{entry.meaning}</div>
          <div className="text-base font-semibold text-[#444444]">
            {entry.synonym}
          </div>
          {imageById[entry.id] && (
            <img
              className="h-24 w-24 rounded border-2 border-black object-cover"
              src={imageById[entry.id]}
              alt={entry.word}
            />
          )}
          <ul className="list-disc space-y-2 pl-6 text-base font-semibold">
            {entry.sentences.map((sentence, index) => (
              <li key={`${entry.id}-${index}`}>{sentence}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export default DayVocabulary
