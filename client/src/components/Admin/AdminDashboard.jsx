import React from 'react'
import PageLayoutDashboard from '../PageLayoutDashboard'
import AdminSessionCard from './AdminSessionCard'
import ActionItems from './ActionItems'
import useCurrentUser from '../useCurrentUser'

const AdminDashboard = () => {
  const { user } = useCurrentUser()
  const userName = user ? `${user.firstName} ${user.lastName}` : ''

  return (
    <PageLayoutDashboard userName={userName} userRole="Admin">
        <div className="text-center">
                <h1>Admin Dashboard</h1>
        </div>
      <div className="flex gap-4 mt-4">
        <AdminSessionCard/>
        <ActionItems/>
      </div>
  
    </PageLayoutDashboard>
  )
}

export default AdminDashboard
