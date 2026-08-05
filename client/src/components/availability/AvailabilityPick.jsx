import React, { useState, useEffect, useRef } from 'react'
import { days, times } from './timeSlots'

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

const parseTimeLabel = (label) => {
  const [timePart, period] = label.split(' ')
  const [hStr, mStr = '0'] = timePart.split(':')
  let hour = parseInt(hStr, 10)
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  return { hour, minutes: parseInt(mStr, 10) }
}

const expandLegacyTimeLabel = (label) => {
  if (label.includes(':')) return [label]
  const match = label.match(/^(\d+)\s*(AM|PM)$/)
  if (!match) return [label]
  const [, hStr, period] = match
  return [`${hStr}:00 ${period}`, `${hStr}:30 ${period}`]
}

const isHourMark = (label) => label.split(':')[1]?.startsWith('00')

const isToday = (d) => {
  const t = new Date()
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
}

const toRanges = (dayTimes) => {
  const allTimes = [...times, '10:00 PM']
  const indices = [...new Set(dayTimes.map(t => times.indexOf(t)))]
    .filter(i => i !== -1)
    .sort((a, b) => a - b)
  if (indices.length === 0) return []

  const ranges = []
  let start = indices[0]
  let prev = indices[0]
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === prev + 1) {
      prev = indices[i]
      continue
    }
    ranges.push(`${times[start]}–${allTimes[prev + 1]}`)
    start = indices[i]
    prev = indices[i]
  }
  ranges.push(`${times[start]}–${allTimes[prev + 1]}`)
  return ranges
}

const AvailabilityPick = ({ title = "Set Weekly Mentoring Hours", availabilityLabel = "Mentor's Availability", onChange, conflicts = [], sessions = [], mentorBusy = [], conflictInfo = {}, sessionInfo = {}, sessionMentorName = '', readOnly = false, mentorSlots = [], initialSlots=[], onSlotSelect, selectedSlot = null }) => {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()))
  const [selectedSlots, setSelectedSlots] = useState([])
  const [displaySlots, setDisplaySlots] = useState([])
  const [slotInfo, setSlotInfo] = useState(null)

  const lastEmittedRef = useRef(null)

  useEffect(()=>{
    const incoming = JSON.stringify(initialSlots)
    if (incoming === lastEmittedRef.current) return
    const ids=initialSlots.flatMap(s => expandLegacyTimeLabel(s.startTime).map(t => `${s.day}-${t}`))
  setSelectedSlots(ids)
  setDisplaySlots(ids)},
  [JSON.stringify(initialSlots)]
  )

  const isDragging = useRef(false)
  const dragMode = useRef('add')
  const selectedSlotsRef = useRef(selectedSlots)
  useEffect(() => { selectedSlotsRef.current = selectedSlots }, [selectedSlots])

  const dragQueueRef = useRef([])
  const rafIdRef = useRef(null)

  const applySlotToArray = (arr, slotId, dateSlotId = '') => {
    if (dragMode.current === 'remove') {
      if (sessions.includes(slotId) || sessions.includes(dateSlotId)) return arr
      if (!arr.includes(slotId)) return arr
      return arr.filter(s => s !== slotId)
    }
    if (arr.includes(slotId)) return arr
    return [...arr, slotId]
  }

  const flushDragQueue = () => {
    rafIdRef.current = null
    const queued = dragQueueRef.current
    dragQueueRef.current = []
    if (queued.length === 0) return
    let next = selectedSlotsRef.current
    for (const { slotId, dateSlotId } of queued) {
      next = applySlotToArray(next, slotId, dateSlotId)
    }
    if (next !== selectedSlotsRef.current) {
      selectedSlotsRef.current = next
      setSelectedSlots(next)
    }
  }

  useEffect(() => {
    const stopDrag = () => {
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      if (dragQueueRef.current.length > 0) flushDragQueue()
      isDragging.current = false
      setDisplaySlots(selectedSlotsRef.current)
    }
    window.addEventListener('mouseup', stopDrag)
    return () => window.removeEventListener('mouseup', stopDrag)
  }, [])

  useEffect(() => {
    if (!onChange) return
    const allTimes = [...times, '10:00 PM']
    const slots = displaySlots.map(slotId => {
      const parts = slotId.split('-')
      if (parts.length === 2) {
        const [day, startTime] = parts
        const endTime = allTimes[times.indexOf(startTime) + 1] || '10:00 PM'
        return { day, startTime, endTime }
      } else {
        const date = parts.slice(0, 3).join('-')
        const startTime = parts.slice(3).join('-')
        const endTime = allTimes[times.indexOf(startTime) + 1] || '10:00 PM'
        const dayIndex = new Date(date + 'T00:00:00').getDay()
        const day = days[dayIndex]
        return { day, date, startTime, endTime }
      }
    })
    lastEmittedRef.current = JSON.stringify(slots)
    onChange(slots)
  }, [displaySlots])

  const prevWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() - 7)
    setWeekStart(d)
    setSlotInfo(null)
  }

  const nextWeek = () => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
    setSlotInfo(null)
  }

  const handleMouseDown = (slotId, isSelected) => {
    isDragging.current = true
    dragMode.current = isSelected ? 'remove' : 'add'
    const next = applySlotToArray(selectedSlotsRef.current, slotId)
    if (next !== selectedSlotsRef.current) {
      selectedSlotsRef.current = next
      setSelectedSlots(next)
    }
  }

  const handleMouseEnter = (slotId, dateSlotId) => {
    if (!isDragging.current) return
    dragQueueRef.current.push({ slotId, dateSlotId })
    if (rafIdRef.current == null) {
      rafIdRef.current = requestAnimationFrame(flushDragQueue)
    }
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return d
  })

  const isoDate = (d) => d.toISOString().slice(0, 10)

  const findFirstSelectableSlot = () => {
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const day = days[dayIdx]
      for (const time of times) {
        const slotId = `${day}-${time}`
        const dateSlotId = `${isoDate(weekDates[dayIdx])}-${time}`
        const slotDate = new Date(weekDates[dayIdx])
        const { hour: slotHour, minutes: slotMinutes } = parseTimeLabel(time)
        slotDate.setHours(slotHour, slotMinutes, 0, 0)
        const beyond48hrs = slotDate > new Date(Date.now() + 48 * 60 * 60 * 1000)
        const isMySession = sessions.includes(slotId) || sessions.includes(dateSlotId)
        const isConflict = conflicts.includes(slotId) || conflicts.includes(dateSlotId)
        const isMentorBusy = mentorBusy.includes(dateSlotId)
        if (beyond48hrs && mentorSlots.includes(slotId) && !isConflict && !isMySession && !isMentorBusy) {
          return dateSlotId
        }
      }
    }
    return null
  }

  const firstSelectableSlot = findFirstSelectableSlot()
  const weekHasSelectableSlot = firstSelectableSlot !== null

  const autoAdvanceCount = useRef(0)
  useEffect(() => {
    if (!readOnly || mentorSlots.length === 0) return
    if (weekHasSelectableSlot) {
      autoAdvanceCount.current = 0
      return
    }
    if (autoAdvanceCount.current >= 12) return
    autoAdvanceCount.current += 1
    const d = new Date(weekStart)
    d.setDate(d.getDate() + 7)
    setWeekStart(d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, weekHasSelectableSlot, readOnly, mentorSlots.length])

  const lastAutoSelected = useRef(null)
  useEffect(() => {
    if (!readOnly) return
    // Stop auto-picking once the mentee has manually chosen something different themselves
    if (selectedSlot && selectedSlot !== lastAutoSelected.current) return
    if (firstSelectableSlot && firstSelectableSlot !== selectedSlot) {
      lastAutoSelected.current = firstSelectableSlot
      onSlotSelect?.(firstSelectableSlot)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstSelectableSlot, readOnly, selectedSlot])

  return (
    <div className="w-full max-w-4xl mx-auto">
      {title && <h2 className="text-base font-bold text-gray-900 text-center mb-3">{title}</h2>}
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-sm font-medium text-slate-600">{formatWeekLabel(weekStart)}</span>
          <div className="flex gap-1">
            <button type="button" onClick={prevWeek} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer">&#8249;</button>
            <button type="button" onClick={nextWeek} className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition cursor-pointer">&#8250;</button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 overflow-hidden select-none" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-x-1 gap-y-0 p-1.5 min-w-140">
              <div className="text-[11px] font-semibold text-slate-400 pb-2">Time</div>
              {days.map((day, i) => (
                <div key={day} className="text-center pb-1.5">
                  <div className="text-[11px] font-semibold text-slate-700">{day}</div>
                  <div className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] mt-0.5 ${
                    isToday(weekDates[i]) ? 'bg-[#00212C] text-white font-semibold' : 'text-slate-400'
                  }`}>{weekDates[i].getDate()}</div>
                </div>
              ))}

              {times.map((time) => {
                const hourMark = isHourMark(time)
                const dividerClass = hourMark ? 'border-t border-slate-200' : 'border-t border-dotted border-slate-200'
                return (
                <React.Fragment key={time}>
                  <div className={`flex items-center h-2.5 whitespace-nowrap pr-1 text-[11px] font-medium text-slate-500 ${dividerClass}`}>
                    {hourMark ? time.replace(':00 ', ' ') : ''}
                  </div>
                  {days.map((day, dayIdx) => {
                    const slotId = `${day}-${time}`
                    const dateSlotId = `${isoDate(weekDates[dayIdx])}-${time}`
                    const isSelected = selectedSlots.includes(slotId)
                    const colDate = new Date(weekStart)
                    colDate.setDate(weekStart.getDate() + dayIdx)
                    colDate.setHours(23, 59, 59, 999)
                    const isPast = readOnly && colDate < new Date()
                    const slotDate = new Date(weekDates[dayIdx])
                    const { hour: slotHour, minutes: slotMinutes } = parseTimeLabel(time)
                    slotDate.setHours(slotHour, slotMinutes, 0, 0)
                    const now = new Date()
                    const beyond48hrs = slotDate > new Date(now.getTime() + 48 * 60 * 60 * 1000)
                    const isMySession = sessions.includes(slotId) || sessions.includes(dateSlotId)
                    const isConflict = conflicts.includes(slotId) || conflicts.includes(dateSlotId)
                    const isMentorBusy = mentorBusy.includes(dateSlotId)
                    const canSelect = readOnly && beyond48hrs && mentorSlots.includes(slotId) && !isConflict && !isMySession && !isMentorBusy
                    const displayDate = weekDates[dayIdx].toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                    const handleClick = () => {
                      if (isMySession) setSlotInfo(`Your session with ${sessionInfo[dateSlotId] || sessionMentorName || 'this mentor'} — ${displayDate} at ${time}`)
                      else if (isConflict) setSlotInfo(`You have a session with ${conflictInfo[dateSlotId] || 'another mentor'} — ${displayDate} at ${time}`)
                      else if (isMentorBusy) setSlotInfo(null)
                      else setSlotInfo(null)
                    }
                    return (
                      <button
                        key={slotId}
                        type="button"
                        onMouseDown={canSelect ? (e) => { e.preventDefault(); onSlotSelect?.(dateSlotId); setSlotInfo(null) } : readOnly ? undefined : isMySession ? undefined : (e) => { e.preventDefault(); handleMouseDown(slotId, isSelected) }}
                        onMouseEnter={readOnly ? undefined : () => handleMouseEnter(slotId, dateSlotId)}
                        onClick={handleClick}
                        className={`h-2.5 select-none ${dividerClass} ${
                          isMySession ? (readOnly ? 'bg-purple-300' : 'bg-red-400') :
                          isConflict ? 'bg-red-400' :
                          isPast ? 'bg-gray-200' :
                          selectedSlot === dateSlotId ? 'bg-green-600' :
                          !readOnly && selectedSlots.includes(slotId) ? 'bg-green-300' :
                          canSelect ? 'bg-green-300' :
                          readOnly ? 'bg-gray-200' : 'bg-gray-100 hover:bg-green-100'
                        }`}
                      />
                    )
                  })}
                </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center items-center mt-3 py-2 px-3 rounded-lg bg-slate-50 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" /> Your Conflicts
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-300" /> {readOnly ? availabilityLabel : 'Your Mentoring Hours'}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-300" /> {readOnly ? `Booked With ${sessionMentorName || 'This Person'}` : 'Your Sessions'}
          </div>
        </div>
        {!readOnly && <p className="text-center text-slate-400 text-xs mt-2">Drag across the grid to edit your mentoring hours</p>}
        {slotInfo && (
          <p className="text-center text-[#00212C] bg-slate-100 rounded-lg px-3 py-2 mt-2 text-xs">{slotInfo}</p>
        )}

        {!readOnly && (
          <div className="mt-2 border-t border-slate-100 pt-2">
            <p className="text-center font-semibold text-slate-700 text-[11px] mb-1">Selected Hours</p>
            <div className="max-h-13.5 overflow-y-auto grid grid-cols-2 gap-x-4 gap-y-0.5 auto-rows-[16px]">
              {displaySlots.length === 0 ? (
                <span className="col-span-2 text-[11px] text-slate-400 text-center">No hours selected yet</span>
              ) : (
                days.map((day) => {
                  const slots = displaySlots
                    .filter(s => s.startsWith(day + '-'))
                    .map(s => s.replace(day + '-', ''))
                  if (slots.length === 0) return null
                  return (
                    <div key={day} className="text-[11px] leading-4 text-slate-600 text-center truncate">
                      <span className="font-semibold text-slate-700">{day}</span> {toRanges(slots).join(', ')}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailabilityPick
