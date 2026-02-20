const ContextWordModal = ({ entry, onClose }) => {
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !entry?.word) {
      return
    }
    const utterance = new SpeechSynthesisUtterance(entry.word)
    utterance.lang = 'en-US'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="w-full max-w-md border-4 border-black bg-[#fff7a8] px-4 py-4 shadow-[0_10px_0_#000000]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="text-2xl font-extrabold">{entry.word}</div>
            <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-[#444444]">
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
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center border-2 border-black bg-white text-base font-extrabold"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {entry.meaning && (
            <div className="text-base font-semibold">{entry.meaning}</div>
          )}
          {entry.myanmarMeaning && (
            <div className="text-sm font-semibold text-[#444444]">
              {entry.myanmarMeaning}
            </div>
          )}
          {entry.synonym && (
            <div className="text-sm font-semibold text-[#444444]">
              Synonym - {entry.synonym}
            </div>
          )}
          {entry.sentences && entry.sentences.length > 0 && (
            <ul className="list-disc space-y-2 pl-5 text-sm font-semibold">
              {entry.sentences.map((sentence, index) => (
                <li key={`${entry.word}-${index}`}>{sentence}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContextWordModal
