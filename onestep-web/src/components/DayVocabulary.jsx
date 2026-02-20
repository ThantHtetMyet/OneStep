import { useMemo, useState } from 'react'
import dataXml from '../Database/vocabulary_data.xml?raw'

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
    myanmarMeaning: entry
      .getElementsByTagName('myanmarmeaning')[0]
      ?.textContent?.trim(),
    skill: entry.getElementsByTagName('skill')[0]?.textContent?.trim(),
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

const DayVocabulary = ({ day, mode, onBack }) => {
  const items = useMemo(() => parseVocabulary(dataXml), [])
  const imageById = useMemo(() => buildImageMap(), [])
  const dayItems = items.filter((entry) => entry.day === String(day))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [guessWord, setGuessWord] = useState('')
  const [selectedPos, setSelectedPos] = useState('')
  const [checked, setChecked] = useState(false)
  const [wordCorrect, setWordCorrect] = useState(false)
  const [posCorrect, setPosCorrect] = useState(false)
  const [results, setResults] = useState(() =>
    dayItems.map(() => null)
  )


  if (dayItems.length === 0) {
    return (
      <div className="mt-8 text-center text-lg font-semibold">
        No vocabulary found for Day-{day}.
      </div>
    )
  }

  const entry = dayItems[currentIndex]
  const imageUrl = entry ? imageById[entry.id] : null
  const isPrevDisabled = currentIndex === 0
  const isNextDisabled = currentIndex === dayItems.length - 1
  const isCheckDisabled = guessWord.trim() === '' || selectedPos === ''

  const resetGuess = () => {
    setGuessWord('')
    setSelectedPos('')
    setChecked(false)
    setWordCorrect(false)
    setPosCorrect(false)
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1)
      resetGuess()
    }
  }

  const handleNext = () => {
    if (currentIndex < dayItems.length - 1) {
      setCurrentIndex((index) => index + 1)
      resetGuess()
    }
  }

  const handleCheck = () => {
    const normalizedWord = guessWord.trim().toLowerCase()
    const actualWord = entry.word?.trim().toLowerCase() ?? ''
    const normalizedSelectedPos = selectedPos.trim().toLowerCase()
    const actualPos = entry.partOfSpeech?.trim().toLowerCase() ?? ''
    const normalizedPos =
      actualPos === 'adj' ? 'adjective' : actualPos === 'adv' ? 'adverb' : actualPos
    const normalizedChoice =
      normalizedSelectedPos === 'adj'
        ? 'adjective'
        : normalizedSelectedPos === 'adv'
        ? 'adverb'
        : normalizedSelectedPos

    const isWordCorrect = normalizedWord === actualWord
    const isPosCorrect = normalizedChoice === normalizedPos

    setWordCorrect(isWordCorrect)
    setPosCorrect(isPosCorrect)
    setChecked(true)
    setResults((prev) => {
      const next = [...prev]
      next[currentIndex] = { wordCorrect: isWordCorrect, posCorrect: isPosCorrect }
      return next
    })
  }

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !entry?.word) {
      return
    }
    const utterance = new SpeechSynthesisUtterance(entry.word)
    utterance.lang = 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  const posOptions = [
    'Noun',
    'Verb',
    'Adjective',
    'Adverb',
    'Pronoun',
    'Preposition',
    'Conjunction',
    'Interjection',
  ]
  const completedCount = results.filter(Boolean).length
  const correctCount = results.filter(
    (result) => result && result.wordCorrect && result.posCorrect
  ).length
  const wrongCount = completedCount - correctCount
  const isFinished = mode === 'answer' && completedCount === dayItems.length

  return (
    <section className="case-normal mx-auto mt-10 flex w-full max-w-4xl flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-2xl font-extrabold">
          Day-{String(day).padStart(2, '0')} · {mode === 'learn' ? 'Learn' : 'Answer'}
        </div>
        <div className="text-lg font-semibold">
          Word {currentIndex + 1} / {dayItems.length}
        </div>
      </div>
      {isFinished && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6 py-10">
          <div className="flex w-full max-w-md flex-col gap-4 border-4 border-black bg-[#f97316] px-6 py-6 text-center shadow-[0_10px_0_#000000]">
            <div className="text-3xl font-extrabold text-white">Final Result</div>
            <div className="rounded border-2 border-black bg-[#22c55e] px-4 py-3 text-xl font-extrabold text-white">
              Correct: {correctCount}
            </div>
            <div className="rounded border-2 border-black bg-[#ef4444] px-4 py-3 text-xl font-extrabold text-white">
              Wrong: {wrongCount}
            </div>
            <button
              type="button"
              onClick={onBack}
              className="border-2 border-black bg-[#ffd44d] px-4 py-2 text-base font-extrabold"
            >
              Back
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-5 border-4 border-black bg-white px-6 py-5 shadow-[0_6px_0_#000000]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded border-2 border-black bg-black px-3 py-1 text-lg font-extrabold text-white">
            No. {entry.id}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[160px_1fr] lg:items-start">
          <div className="flex items-center gap-4 lg:justify-center">
            {imageUrl ? (
              <img
                className="h-32 w-32 rounded border-2 border-black object-cover"
                src={imageUrl}
                alt="Vocabulary"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded border-2 border-black bg-[#f2f0ee] text-sm font-semibold">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {mode === 'answer' && (
              <div className="flex flex-col gap-3">
                <div className="text-base font-semibold">Guess the word</div>
                <input
                  value={guessWord}
                  onChange={(event) => setGuessWord(event.target.value)}
                  className="w-full border-2 border-black px-3 py-2 text-base font-semibold"
                  placeholder="Type the word"
                />
                <div className="text-base font-semibold">Select part of speech</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {posOptions.map((option) => {
                    const isSelected = selectedPos === option
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedPos(option)}
                        className={`border-2 border-black px-3 py-2 text-sm font-extrabold ${
                          isSelected
                            ? 'bg-[#22c55e] text-white'
                            : 'bg-[#fef08a] text-[#111111]'
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleCheck}
                  disabled={isCheckDisabled}
                  className="w-full border-2 border-black bg-[#3a7be0] px-4 py-2 text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Check
                </button>
              </div>
            )}

            {mode === 'answer' && checked && (
              <div className="relative flex flex-col gap-3 border-2 border-black bg-[#fff7a8] px-5 py-4 shadow-[0_10px_0_#000000]">
                <div className="absolute -right-3 -top-3 h-8 w-8 rotate-12 rounded-full border-2 border-black bg-[#ffd84d]" />
                <div className="text-base font-semibold">
                  Word: {wordCorrect ? '✅' : '❌'}
                </div>
                <div className="text-base font-semibold">
                  Part of Speech: {posCorrect ? '✅' : '❌'}
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="text-3xl font-extrabold">{entry.word}</div>
                  <div className="flex flex-wrap items-center gap-2 text-lg font-semibold text-[#444444]">
                    <span>{entry.partOfSpeech ? `(${entry.partOfSpeech})` : ''}</span>
                    <button
                      type="button"
                      onClick={handleSpeak}
                      className="border-2 border-black bg-[#7ed957] px-3 py-1 text-sm font-extrabold"
                    >
                      🔊
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-semibold">{entry.meaning}</div>
                </div>
                {entry.myanmarMeaning && (
                  <div className="text-base font-semibold text-[#444444]">
                    {entry.myanmarMeaning}
                  </div>
                )}
                <div className="text-base font-semibold text-[#444444]">
                  Synonym - {entry.synonym}
                </div>
                <ul className="list-disc space-y-2 pl-6 text-base font-semibold">
                  {entry.sentences.map((sentence, index) => (
                    <li key={`${entry.id}-${index}`}>{sentence}</li>
                  ))}
                </ul>
              </div>
            )}

            {mode === 'learn' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="text-3xl font-extrabold">{entry.word}</div>
                  <div className="flex flex-wrap items-center gap-2 text-lg font-semibold text-[#444444]">
                    <span>{entry.partOfSpeech ? `(${entry.partOfSpeech})` : ''}</span>
                    <button
                      type="button"
                      onClick={handleSpeak}
                      className="border-2 border-black bg-[#7ed957] px-3 py-1 text-sm font-extrabold"
                    >
                      🔊
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-semibold">{entry.meaning}</div>
                </div>
                {entry.myanmarMeaning && (
                  <div className="text-base font-semibold text-[#444444]">
                    {entry.myanmarMeaning}
                  </div>
                )}
                <div className="text-base font-semibold text-[#444444]">
                  Synonym - {entry.synonym}
                </div>
                <ul className="list-disc space-y-2 pl-6 text-base font-semibold">
                  {entry.sentences.map((sentence, index) => (
                    <li key={`${entry.id}-${index}`}>{sentence}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-black bg-[#ffd44d] px-4 py-2 text-base font-extrabold"
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isPrevDisabled}
            className="border-2 border-black bg-[#8b5cf6] px-4 py-2 text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isNextDisabled}
            className="border-2 border-black bg-[#f97316] px-4 py-2 text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  )
}

export default DayVocabulary
