import React, { useState, useEffect, useRef } from 'react'

const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

const getWeekStart = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const formatWeekLabel = (weekStart) => {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const startMonth = months[weekStart.getMonth()]
  const endMonth = months[weekEnd.getMonth()]
  const year = weekStart.getFullYear()

  return startMonth === endMonth
    ? `Week of ${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()} ${year}`
    : `Week of ${startMonth} ${weekStart.getDate()}-${endMonth} ${weekEnd.getDate()} ${year}`
}

const times = [
  "8 AM", "9 AM", "10 AM", "11 AM", "12 PM",
  "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM",
]

const AvailabilityPick = ({ title = "Set Weekly Mentoring Hours", onChange, conflicts = [], sessions = [], readOnly = false, mentorSlots = [], initialSlots=[], onSlotSelect, selectedSlot = null }) => {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [selectedSlots, setSelectedSlots] = useState([])

  useEffect(()=>{
    const ids=initialSlots.map(s => `${s.day}-${s.startTime}`)
  setSelectedSlots(ids)},
  [JSON.stringify(initialSlots)]
  )

  const isDragging = useRef(false)
  const dragMode = useRef('add')

  useEffect(() => {
    const stopDrag = () => { isDragging.current = false }
    window.addEventListener('mouseup', stopDrag)
    return () => window.removeEventListener('mouseup', stopDrag)
  }, [])

  useEffect(() => {
    if (!onChange) return
    const allTimes = [...times, '9 PM']
    const slots = selectedSlots.map(slotId => {
      const parts = slotId.split('-')
      if (parts.length === 2) {
        // Weekly recurring format: "DAY-H AM/PM" (e.g. "MON-9 AM")
        const [day, startTime] = parts
        const endTime = allTimes[times.indexOf(startTime) + 1] || '9 PM'
        return { day, startTime, endTime }
      } else {
        // Date-specific format: "YYYY-MM-DD-H AM/PM"
        const date = parts.slice(0, 3).join('-')   // "YYYY-MM-DD"
        const startTime = parts.slice(3).join('-') // "H AM" or "H PM"
        const endTime = allTimes[times.indexOf(startTime) + 1] || '9 PM'
        const dayIndex = new Date(date + 'T00:00:00').getDay()
        const day = days[dayIndex]
        return { day, date, startTime, endTime }
      }
    })
    onChange(slots)
  }, [selectedSlots])

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
  }

  const applySlot = (slotId) => {
    setSelectedSlots(prev => {
      if (dragMode.current === 'remove') return prev.filter(s => s !== slotId)
      if (prev.includes(slotId)) return prev
      return [...prev, slotId]
    })
  }


  const handleMouseDown = (slotId, isSelected) => {
    isDragging.current = true
    dragMode.current = isSelected ? 'remove' : 'add'
    applySlot(slotId)
  }

  const handleMouseEnter = (slotId) => {
    if (isDragging.current) applySlot(slotId)
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const isoDate = (d) => d.toISOString().slice(0, 10)

  return (
    <div className="w-full">
      {title && <h2 className="text-xs font-bold text-gray-900 text-center mb-1">{title}</h2>}
      <div className="rounded-xl bg-white p-1.5 shadow-md">
        <div className="flex items-center justify-between mb-1 px-1">
          <span className="text-xs text-gray-600">{formatWeekLabel(weekStart)}</span>
          <div className="flex gap-1">
            <button type="button" onClick={prevWeek} className="text-cyan-600 text-sm px-1">&#8249;</button>
            <button type="button" onClick={nextWeek} className="text-cyan-600 text-sm px-1">&#8250;</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="grid grid-cols-8" style={{ fontSize: '9px', columnGap: '2px', rowGap: '0px' }}>
            <div className="font-semibold text-gray-500 py-0.5">Time</div>
            {days.map((day, i) => (
              <div key={day} className="text-center py-0.5">
                <div className="text-gray-500">{weekDates[i].getDate()}</div>
                <div className="font-semibold text-gray-700">{day}</div>
              </div>
            ))}

            {times.map((time) => (
              <React.Fragment key={time}>
                <div className="flex h-4 items-center text-gray-500 whitespace-nowrap pr-1">{time}</div>
                {days.map((day, dayIdx) => {
                  const slotId = `${day}-${time}`
                  const isSelected = selectedSlots.includes(slotId)
                  const colDate = new Date(weekStart)
                  colDate.setDate(weekStart.getDate() + dayIdx)
                  const slotDate = new Date(colDate)
                  slotDate.setHours(0, 0, 0, 0)
                  colDate.setHours(23, 59, 59, 999)
                  const isPast = colDate < new Date()
                  return (
                    <button
                      key={slotId}
                      type="button"
                      onMouseDown={readOnly ? () => !isPast && mentorSlots.includes(slotId) && onSlotSelect?.({ slotId, date: slotDate }) : () => handleMouseDown(slotId, isSelected)}
                      onMouseEnter={readOnly ? undefined : () => handleMouseEnter(slotId)}
                      className={`h-4 rounded-none select-none transition ${
                        isPast ? 'bg-gray-200' :
                        conflicts.includes(slotId) ? 'bg-red-400' :
                        (selectedSlot === slotId || selectedSlot?.slotId === slotId) ? 'bg-purple-300' :
                        sessions.includes(slotId) ? 'bg-purple-300' :
                        (readOnly ? mentorSlots : selectedSlots).includes(slotId) ? 'bg-green-300' :
                        readOnly ? 'bg-gray-300' : 'bg-gray-300 hover:bg-green-100'
                      }`}
                    />
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-2 text-gray-600" style={{ fontSize: '9px' }}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-400" /> Your Conflicts
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-300" /> {readOnly ? "Mentor's Availability" : 'Your Mentoring Hours'}
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-300" /> Your Sessions
          </div>
        </div>
        {!readOnly && <p className="text-center text-gray-500 mt-0.5" style={{ fontSize: '9px' }}>Drag to Edit Mentoring Hours</p>}

        {selectedSlots.length > 0 && (
          <div className="mt-2 border-t pt-2">
            <p className="text-center font-semibold text-gray-700 mb-1" style={{ fontSize: '9px' }}>Selected Hours</p>
            <div className="flex flex-col gap-0.5">
              {days.map((day, i) => {
                const dateStr = isoDate(weekDates[i])
                const slots = selectedSlots
                  .filter(s => s.startsWith(dateStr + '-'))
                  .map(s => s.replace(dateStr + '-', ''))
                if (slots.length === 0) return null
                return (
                  <div key={day} className="flex gap-1 items-start" style={{ fontSize: '9px' }}>
                    <span className="font-semibold text-gray-700 w-6 shrink-0">{day}:</span>
                    <span className="text-gray-600">{slots.join(', ')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailabilityPick
