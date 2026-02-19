import footprint from './assets/footprint.png'

function App() {
  return (
    <div className="min-h-screen bg-[#f2f0ee] text-[#111111]">
      <header className="flex items-center justify-center bg-[#d59a2a] py-5">
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-wide">
          <span className="inline-block">I-STEP</span>
          <img
            className="block h-[28px] w-[28px] rotate-[20deg]"
            src={footprint}
            alt=""
          />
        </div>
      </header>

      <section className="grid grid-cols-2 justify-items-center gap-6 px-6 pt-8">
        <div className="flex h-[190px] w-[170px] flex-col items-center justify-center gap-3 border-4 border-black bg-[#3a7be0] shadow-[0_6px_0_#000000]">
          <div className="grid h-10 w-10 place-items-center rounded-[2px] border-2 border-black bg-black text-2xl text-[#e7e7e7]">
            ◎
          </div>
          <div className="text-3xl font-extrabold">Day-01</div>
        </div>

        <div className="flex h-[190px] w-[170px] flex-col items-center justify-center gap-3 border-4 border-black bg-[#d6453b] shadow-[0_6px_0_#000000]">
          <div className="grid h-10 w-10 place-items-center rounded-[2px] border-2 border-black bg-black text-2xl text-[#e7e7e7]">
            ◔
          </div>
          <div className="text-3xl font-extrabold">Day-02</div>
        </div>
      </section>
    </div>
  )
}

export default App
