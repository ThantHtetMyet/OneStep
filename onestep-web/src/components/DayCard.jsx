const DayCard = ({ label, icon, colorClass, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[190px] w-[170px] flex-col items-center justify-center gap-3 border-4 border-black shadow-[0_6px_0_#000000] ${colorClass}`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-[2px] border-2 border-black bg-black text-2xl text-[#e7e7e7]">
        {icon}
      </div>
      <div className="text-3xl font-extrabold">{label}</div>
    </button>
  )
}

export default DayCard
