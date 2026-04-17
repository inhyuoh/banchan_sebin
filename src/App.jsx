import { useLocalStorage } from './hooks/useLocalStorage'
import RoleSelect from './screens/RoleSelect'
import MotherScreen from './screens/MotherScreen'
import ManagerScreen from './screens/ManagerScreen'
import AdminDashboard from './screens/AdminDashboard'

export default function App() {
  const [role, setRole] = useLocalStorage('banchang_role', null)

  const handleRoleChange = () => setRole(null)

  if (!role) return <RoleSelect onSelect={setRole} />
  if (role === 'mother') return <MotherScreen onRoleChange={handleRoleChange} />
  if (role === 'dangsan' || role === 'jangseng')
    return <ManagerScreen storeId={role} onRoleChange={handleRoleChange} />
  if (role === 'admin') return <AdminDashboard onRoleChange={handleRoleChange} />

  return <RoleSelect onSelect={setRole} />
}
