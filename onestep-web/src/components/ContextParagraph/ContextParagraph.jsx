import { useCallback, useEffect, useMemo, useState } from 'react'
import dataXml from '../../Database/vocabulary_data.xml?raw'
import ContextWordModal from './ContextWordModal'

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
    synonym: entry.getElementsByTagName('synonym')[0]?.textContent?.trim(),
    sentences: Array.from(entry.getElementsByTagName('sentence')).map((node) =>
      node.textContent?.trim()
    ),
  }))
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const dayHighlightClasses = {
  '1': 'bg-[#fef08a]',
  '2': 'bg-[#bbf7d0]',
  '3': 'bg-[#bfdbfe]',
  '4': 'bg-[#fecaca]',
  '5': 'bg-[#fde68a]',
  '6': 'bg-[#e9d5ff]',
}

const resolveHighlightClass = (day) =>
  dayHighlightClasses[day] ?? 'bg-[#fef08a]'

const requestAiParagraph = async (dayGroups, token) => {
  if (dayGroups.length === 0) {
    return ''
  }
  const dayLines = dayGroups
    .map(
      ({ day, words }) =>
        `Day-${String(day).padStart(2, '0')}: ${words.join(', ')}`
    )
    .join('\n')
  const prompt = `Write one natural, contextual paragraph per day in this order. Each paragraph must use only that day's words exactly once and keep the same word casing. Return only the paragraphs in order, separated by a blank line. Do not add labels or analysis. Words by day:\n${dayLines}`
  const headers = token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' }
  const apiBase = import.meta.env.DEV
    ? '/api/hf'
    : 'https://router.huggingface.co'
  const response = await fetch(`${apiBase}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'moonshotai/Kimi-K2-Instruct-0905',
      messages: [
        {
          role: 'system',
          content:
            'Respond with only the requested paragraphs. Do not include analysis, reasoning, labels, or extra text.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 220,
    }),
  })
  const rawText = await response.text()
  let data = null
  try {
    data = JSON.parse(rawText)
  } catch {
    data = rawText
  }
  if (!response.ok) {
    throw new Error(data?.error || rawText || 'AI request failed.')
  }
  if (data?.choices?.[0]?.message?.content) {
    return data.choices[0].message.content.trim()
  }
  if (typeof data === 'string') {
    return data.trim()
  }
  throw new Error('AI did not return text.')
}

const highlightParagraph = (text, wordInfoMap, onWordClick) => {
  if (!text) {
    return ''
  }
  const words = Object.keys(wordInfoMap)
  if (words.length === 0) {
    return text
  }
  const escapedWords = words.map(escapeRegExp).join('|')
  if (!escapedWords) {
    return text
  }
  const regex = new RegExp(`\\b(${escapedWords})\\b`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) => {
    const lower = part.toLowerCase()
    const entry = wordInfoMap[lower]
    if (entry) {
      const highlightClass = resolveHighlightClass(entry.day)
      return (
        <button
          type="button"
          onClick={() => onWordClick(entry)}
          key={`${part}-${index}`}
          className={`inline-flex items-center rounded-sm px-1 text-[#111111] ${highlightClass}`}
        >
          {part}
        </button>
      )
    }
    return <span key={`${part}-${index}`}>{part}</span>
  })
}

const ContextParagraph = ({ onBack }) => {
  const entries = useMemo(() => parseVocabulary(dataXml), [])
  const orderedEntries = useMemo(() => {
    return [...entries]
      .filter((entry) => entry.word)
      .sort((a, b) => {
        const dayA = Number(a.day ?? Number.POSITIVE_INFINITY)
        const dayB = Number(b.day ?? Number.POSITIVE_INFINITY)
        if (dayA !== dayB) {
          return dayA - dayB
        }
        const idA = Number(a.id ?? Number.POSITIVE_INFINITY)
        const idB = Number(b.id ?? Number.POSITIVE_INFINITY)
        return idA - idB
      })
  }, [entries])
  const dayGroups = useMemo(() => {
    const groups = new Map()
    orderedEntries.forEach((entry) => {
      if (!entry.day || !entry.word) {
        return
      }
      if (!groups.has(entry.day)) {
        groups.set(entry.day, [])
      }
      groups.get(entry.day).push(entry.word)
    })
    return Array.from(groups.entries())
      .sort(([dayA], [dayB]) => Number(dayA) - Number(dayB))
      .map(([day, dayWords]) => ({ day, words: dayWords }))
  }, [orderedEntries])
  const wordInfoMap = useMemo(
    () =>
      entries.reduce((acc, entry) => {
        if (entry.word && entry.day) {
          acc[entry.word.toLowerCase()] = entry
        }
        return acc
      }, {}),
    [entries]
  )
  const [paragraph, setParagraph] = useState('')
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState('')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const hfToken = import.meta.env.VITE_HF_TOKEN?.trim()

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setError('')
    try {
      const result = await requestAiParagraph(dayGroups, hfToken)
      setParagraph(result)
    } catch (err) {
      setParagraph('')
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate paragraph.'
      )
    } finally {
      setIsGenerating(false)
    }
  }, [dayGroups, hfToken])

  useEffect(() => {
    generate()
  }, [generate])

  return (
    <section className="case-normal mx-auto mt-10 flex w-full max-w-4xl flex-col gap-6 px-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-2xl font-extrabold">Contextual Paragraph</div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={generate}
            className="border-2 border-black bg-[#7ed957] px-4 py-2 text-base font-extrabold"
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={onBack}
            className="border-2 border-black bg-[#ffd44d] px-4 py-2 text-base font-extrabold"
          >
            Back
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4 border-4 border-black bg-white px-6 py-5 shadow-[0_6px_0_#000000]">
        {isGenerating && (
          <div className="text-base font-semibold text-[#444444]">
            Generating paragraph...
          </div>
        )}
        {!isGenerating && error && (
          <div className="text-base font-semibold text-[#b91c1c]">{error}</div>
        )}
        {!isGenerating && !error && paragraph && (
          <div className="text-lg font-semibold leading-relaxed">
            {highlightParagraph(paragraph, wordInfoMap, setSelectedEntry)}
          </div>
        )}
        {!isGenerating && !error && !paragraph && (
          <div className="text-base font-semibold text-[#444444]">
            No words found.
          </div>
        )}
      </div>
      {selectedEntry && (
        <ContextWordModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </section>
  )
}

export default ContextParagraph
