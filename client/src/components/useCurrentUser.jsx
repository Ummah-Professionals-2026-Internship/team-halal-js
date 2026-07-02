import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const useCurrentUser = () => {
  const [user, setUser] = useState({ firstName: '', lastName: '' })
  const navigate = useNavigate()

  const fetchUser = useCallback(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) {
          navigate('/login', { replace: true })
          return null
        }
        return res.json()
      })
      .then(data => { if (data) setUser(data) })
  }, [navigate])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, refreshUser: fetchUser }
}

export default useCurrentUser
