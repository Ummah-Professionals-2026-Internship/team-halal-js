import React from 'react'
import { useState, useEffect } from 'react'

const useCurrentUser = () => {

    const [user, setUser]=useState({firstName:'',lastName:''})
    useEffect (()=>{
      const token = localStorage.getItem('token')
      fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res=>res.json())
      .then(data=>setUser(data))
    },[])


  return user}

export default CurrentUser
