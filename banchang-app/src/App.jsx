import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import RoleSelect from './screens/RoleSelect'
import MotherScreen from './screens/MotherScreen'
import ManagerScreen from './screens/ManagerScreen'
import AdminDashboard from './screens/AdminDashboard'
import SampleGallery from './screens/SampleGallery'

export default function App() {
  const [role, setRole] = useLocalStorage('banchang_role', null)
  const [showGallery, setShowGallery] = useState(false)

  const handleRoleChange = () => setRole(null)

  if (showGallery)
    return <SampleGallery role={role} onBack={() => setShowGallery(false)} />

  if (!role) return <RoleSelect onSelect={setRole} onGallery={() => setShowGallery(true)} />
  if (role === 'mother') return <MotherScreen onRoleChange={handleRoleChange} onGallery={() => setShowGallery(true)} />
  if (role === 'dangsan' || role === 'jangseng')
    return <ManagerScreen storeId={role} onRoleChange={handleRoleChange} onGallery={() => setShowGallery(true)} />
  if (role === 'admin') return <AdminDashboard onRoleChange={handleRoleChange} onGallery={() => setShowGallery(true)} />

  return <RoleSelect onSelect={setRole} />
}
