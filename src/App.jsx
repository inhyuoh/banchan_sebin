import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import RoleSelect from './screens/RoleSelect'
import MotherScreen from './screens/MotherScreen'
import ManagerScreen from './screens/ManagerScreen'
import AdminDashboard from './screens/AdminDashboard'
import SampleGallery from './screens/SampleGallery'
import BottomTabBar from './components/BottomTabBar'

export default function App() {
  const [role, setRole] = useLocalStorage('banchang_role', null)

  function handleTab(tabId) {
    if (tabId === 'gallery') {
      setRole('gallery')
    } else {
      setRole(tabId)
    }
  }

  if (!role) return <RoleSelect onSelect={setRole} />

  const current = role === 'gallery' ? 'gallery'
    : role === 'mother' ? 'mother'
    : role === 'dangsan' ? 'dangsan'
    : role === 'jangseng' ? 'jangseng'
    : role === 'admin' ? 'admin'
    : null

  function renderScreen() {
    if (role === 'gallery') return <SampleGallery role='mother' onBack={() => setRole('mother')} />
    if (role === 'mother') return <MotherScreen />
    if (role === 'dangsan' || role === 'jangseng') return <ManagerScreen storeId={role} />
    if (role === 'admin') return <AdminDashboard />
    return null
  }

  return (
    <div>
      <div className="pb-16">
        {renderScreen()}
      </div>
      <BottomTabBar current={current} onChange={handleTab} />
    </div>
  )
}
