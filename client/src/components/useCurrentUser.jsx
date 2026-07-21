import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api-calls/auth'

const useCurrentUser = () => {
  const [user, setUser] = useState({ firstName: '', lastName: '' })
  const navigate = useNavigate()

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    try {
      const data = await getMe()
      if (data) setUser(data)
    } catch {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, refreshUser: fetchUser }
}

export default useCurrentUser
