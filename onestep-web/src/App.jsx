import { useState } from 'react'
import DayCard from './components/DayCard'
import DayVocabulary from './components/DayVocabulary'
import footprint from './assets/footprint.png'

function App() {
  const [selectedDay, setSelectedDay] = useState(null)

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
        <section className="grid grid-cols-2 justify-items-center gap-6 px-6 pt-8">
          <DayCard
            label="Day-01"
            icon="◎"
            colorClass="bg-[#3a7be0]"
            onClick={() => setSelectedDay(1)}
          />
          <DayCard
            label="Day-02"
            icon="◔"
            colorClass="bg-[#d6453b]"
            onClick={() => setSelectedDay(2)}
          />
        </section>
      )}
      {selectedDay && (
        <DayVocabulary
          key={selectedDay}
          day={selectedDay}
          onBack={() => setSelectedDay(null)}
        />
      )}
    </div>
  )
}

export default App
