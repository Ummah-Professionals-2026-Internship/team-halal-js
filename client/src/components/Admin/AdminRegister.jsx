import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../AuthLayout'
import AuthCard from '../AuthCard'

const AdminRegister = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', adminSecret: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.message)
      localStorage.setItem('token', data.token)
      navigate('/admin/dashboard')
    } catch {
      setError('Could not connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full max-w-[385px] h-[70px] bg-white border border-[#CFC5B3] rounded-lg pl-5 box-border text-2xl font-normal text-[#656565] transition-all duration-200 block mx-auto focus:border-[#007CA6] focus:ring-3 focus:ring-[rgba(0,124,166,0.15)] focus:outline-none placeholder:text-[#656565] placeholder:opacity-80"

  return (
    <AuthLayout>
      <AuthCard title="Admin Registration">
        <form className="flex flex-col items-center gap-5 w-full m-0 p-0 box-border" onSubmit={handleSubmit}>
          {error && <p className="w-full max-w-[385px] text-base text-[#c0392b] text-center mx-auto">{error}</p>}
          <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className={inputClasses} />
          <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className={inputClasses} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClasses} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required className={inputClasses} />
          <input name="adminSecret" type="password" placeholder="Admin Secret Code" value={form.adminSecret} onChange={handleChange} required className={inputClasses} />
          <button
            type="submit"
            disabled={loading}
            className="w-full max-w-[385px] h-[69px] bg-[#007CA6] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold shadow-[0_4px_12px_rgba(0,124,166,0.15)] cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#00698d] block mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      </AuthCard>
      <button
        className="md:absolute md:bottom-10 md:left-[92px] w-[170px] h-[65px] bg-[#003F55] border border-[#036383] rounded-lg text-[#F5F5F5] text-[25px] font-bold cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-[#002d3e] flex items-center justify-center self-center md:self-auto mt-5 md:mt-0"
        onClick={() => navigate('/login')}
      >
        Back
      </button>
    </AuthLayout>
  )
}

export default AdminRegister
