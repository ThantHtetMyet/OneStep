import { useState } from 'react'
import DayCard from './components/DayCard'
import DayVocabulary from './components/DayVocabulary'
import dataXml from './Database/vocabulary_data.xml?raw'
import footprint from './assets/footprint.png'

const normalizeXml = (xml) => xml.replace(/^\s*sentences>/gm, '<sentences>')

const parseSkillsByDay = (xml) => {
  const parser = new DOMParser()
  const document = parser.parseFromString(normalizeXml(xml), 'text/xml')
  if (document.getElementsByTagName('parsererror').length > 0) {
    return {}
  }
  const map = {}
  Array.from(document.getElementsByTagName('entry')).forEach((entry) => {
    const day = entry.getElementsByTagName('day')[0]?.textContent?.trim()
    const skill = entry.getElementsByTagName('skill')[0]?.textContent?.trim()
    if (day && skill && !map[day]) {
      map[day] = skill
    }
  })
  return map
}

const skillsByDay = parseSkillsByDay(dataXml)

function App() {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedMode, setSelectedMode] = useState(null)

  return (
    <div className="min-h-screen bg-[#f2f0ee] text-[#111111]">
      <header className="flex items-center justify-center bg-[#d59a2a] py-5">
        <div className="relative flex items-center text-4xl font-extrabold tracking-wide">
          <span className="inline-block">I-STEP</span>
          <img
            className="absolute right-[-18px] top-[76%] h-[28px] w-[28px] -translate-y-1/2 rotate-[30deg]"
            src={footprint}
            alt=""
          />
        </div>
      </header>

      {!selectedDay && (
        <section className="mx-auto grid w-full max-w-[520px] grid-cols-2 justify-items-center gap-6 px-6 pt-8">
          <DayCard
            label="Day-01"
            icon="◎"
            skill={skillsByDay[1]}
            colorClass="bg-[#3a7be0]"
            onClick={() => {
              setSelectedDay(1)
              setSelectedMode(null)
            }}
          />
          <DayCard
            label="Day-02"
            icon="◔"
            skill={skillsByDay[2]}
            colorClass="bg-[#d6453b]"
            onClick={() => {
              setSelectedDay(2)
              setSelectedMode(null)
            }}
          />
        </section>
      )}
      {selectedDay && !selectedMode && (
        <section className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-6 px-6 pb-10">
          <div className="text-center text-2xl font-extrabold">
            Choose mode for Day-{String(selectedDay).padStart(2, '0')}
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setSelectedMode('learn')}
              className="border-4 border-black bg-[#4cc3ff] px-6 py-4 text-xl font-extrabold shadow-[0_6px_0_#000000]"
            >
              Learn
            </button>
            <button
              type="button"
              onClick={() => setSelectedMode('answer')}
              className="border-4 border-black bg-[#f15a59] px-6 py-4 text-xl font-extrabold text-white shadow-[0_6px_0_#000000]"
            >
              Answer
            </button>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="border-2 border-black bg-[#ffd44d] px-6 py-3 text-base font-extrabold"
            >
              Back
            </button>
          </div>
        </section>
      )}
      {selectedDay && selectedMode && (
        <DayVocabulary
          key={`${selectedDay}-${selectedMode}`}
          day={selectedDay}
          mode={selectedMode}
          onBack={() => setSelectedMode(null)}
        />
      )}
    </div>
  )
}

export default App
