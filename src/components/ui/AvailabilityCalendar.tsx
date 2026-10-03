import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface Props {
  selectedDate: string
  onSelectDate: (date: string) => void
}

// ============================================
// FAKE "FULLY BOOKED" DATES — real app mein API se aayenge
// Hum yahan date ke "din" (date number) se decide kar rahe hain
// taaki demo mein consistently kuch dates booked dikhein
// ============================================
const isFullyBooked = (day: number) => [5, 12, 18, 19, 26].includes(day)

const AvailabilityCalendar = ({ selectedDate, onSelectDate }: Props) => {
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const changeMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1))
  }

  const handleDayClick = (day: number) => {
    const date = new Date(year, month, day)
    if (date < today || isFullyBooked(day)) return
    // YYYY-MM-DD format banao
    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    onSelectDate(formatted)
  }

  return (
    <div className="bg-white rounded-xl border border-sand p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-ivory transition-colors">
          <FiChevronLeft size={14} />
        </button>
        <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.82rem] text-ink font-semibold">{monthName}</span>
        <button onClick={() => changeMonth(1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-ivory transition-colors">
          <FiChevronRight size={14} />
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ fontFamily: "'Jost', sans-serif" }} className="text-center text-[0.65rem] text-umber font-medium">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells before month starts */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}

        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const date = new Date(year, month, day)
          const isPast = date < today
          const isBooked = isFullyBooked(day)
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDate === dateStr
          const isDisabled = isPast || isBooked

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={isDisabled}
              style={{ fontFamily: "'Jost', sans-serif" }}
              className={`relative aspect-square rounded-lg text-[0.75rem] flex items-center justify-center transition-colors ${
                isSelected ? 'bg-gold text-white font-semibold' :
                isDisabled ? 'text-sand cursor-not-allowed' :
                'text-ink hover:bg-ivory'
              }`}
            >
              {day}
              {isBooked && !isPast && (
                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-coral" />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-sand">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-coral" />
          <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-umber">Fully booked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-gold" />
          <span style={{ fontFamily: "'Jost', sans-serif" }} className="text-[0.65rem] text-umber">Selected</span>
        </div>
      </div>
    </div>
  )
}

export default AvailabilityCalendar