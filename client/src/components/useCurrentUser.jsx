import { useState, useEffect, useCallback } from 'react'

const useCurrentUser = () => {
  const [user, setUser] = useState({ firstName: '', lastName: '' })

  const fetchUser = useCallback(() => {
    const token = localStorage.getItem('token')
    fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setUser(data) })
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { user, refreshUser: fetchUser }
}

export default useCurrentUser
