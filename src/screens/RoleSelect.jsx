const roles = [
  {
    id: 'mother',
    label: '어머니',
    desc: '반찬 제조 및 수량 입력',
    emoji: '👩‍🍳',
    bg: 'bg-green-50',
    border: 'border-green-300',
    btnBg: 'bg-green-500',
    textColor: 'text-green-700'
  },
  {
    id: 'dangsan',
    label: '당산점 점장',
    desc: '판매·폐기 수량 입력',
    emoji: '🏪',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    btnBg: 'bg-blue-500',
    textColor: 'text-blue-700'
  },
  {
    id: 'jangseng',
    label: '장승배기점 점장',
    desc: '판매·폐기 수량 입력',
    emoji: '🏬',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    btnBg: 'bg-blue-500',
    textColor: 'text-blue-700'
  },
  {
    id: 'admin',
    label: '관리자',
    desc: '매출·수익 통계 조회',
    emoji: '📊',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    btnBg: 'bg-orange-500',
    textColor: 'text-orange-700'
  }
]

export default function RoleSelect({ onSelect }) {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[430px]">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🥘</div>
          <h1 className="text-2xl font-bold text-amber-800">반찬가게 관리</h1>
          <p className="text-sm text-amber-600 mt-1">역할을 선택해 주세요</p>
        </div>

        <div className="flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={`w-full ${role.bg} border-2 ${role.border} rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-95 transition-transform`}
            >
              <span className="text-4xl">{role.emoji}</span>
              <div className="text-left flex-1">
                <div className={`font-bold text-lg ${role.textColor}`}>{role.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{role.desc}</div>
              </div>
              <div className={`${role.btnBg} text-white rounded-xl px-3 py-1.5 text-sm font-medium`}>
                입장
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-amber-400 mt-6">
          하나로마트 반찬 납품 관리 시스템
        </p>
      </div>
    </div>
  )
}
