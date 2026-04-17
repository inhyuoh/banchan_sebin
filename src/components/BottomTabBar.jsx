const TABS = [
  { id: 'mother',   label: '어머니',   emoji: '👩‍🍳', color: 'text-green-500' },
  { id: 'dangsan',  label: '당산점',   emoji: '🏪', color: 'text-blue-500' },
  { id: 'jangseng', label: '장승배기', emoji: '🏬', color: 'text-blue-500' },
  { id: 'admin',    label: '관리자',   emoji: '📊', color: 'text-orange-500' },
  { id: 'gallery',  label: '갤러리',   emoji: '📸', color: 'text-purple-500' },
]

export default function BottomTabBar({ current, onChange }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[430px] bg-white border-t border-gray-200 flex">
        {TABS.map((tab) => {
          const active = current === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                active ? tab.color : 'text-gray-400'
              }`}
            >
              <span className={`text-xl leading-none transition-transform ${active ? 'scale-110' : ''}`}>
                {tab.emoji}
              </span>
              <span className={`text-[10px] font-medium ${active ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-current" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
