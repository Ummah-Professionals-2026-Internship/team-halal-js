import { useState, useEffect } from 'react'
import { getSessions } from '../../api-calls/sessions'

const useSessions = () => {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .catch(console.error)
  }, [])

  return { sessions }
}

export default useSessions
