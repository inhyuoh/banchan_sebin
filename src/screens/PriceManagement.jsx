import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/dataHelpers'

export default function PriceManagement() {
  const [prices, setPrices] = useLocalStorage('banchang_prices', {})
  const [entries, setEntries] = useState(() =>
    Object.entries(prices).map(([name, price]) => ({ id: generateId(), name, price: String(price) }))
  )
  const [saved, setSaved] = useState(false)
  const [search, setSearch] = useState('')

  function addRow() {
    setEntries((prev) => [...prev, { id: generateId(), name: '', price: '' }])
  }

  function updateRow(id, field, value) {
    setEntries((prev) => prev.map((r) => r.id === id ? { ...r, [field]: value } : r))
  }

  function removeRow(id) {
    setEntries((prev) => {
      const next = prev.filter((r) => r.id !== id)
      return next.length === 0 ? [{ id: generateId(), name: '', price: '' }] : next
    })
  }

  function handleSave() {
    const next = {}
    entries.forEach(({ name, price }) => {
      if (name.trim() && Number(price) > 0) {
        next[name.trim()] = Number(price)
      }
    })
    setPrices(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filtered = entries.filter((r) => r.name.includes(search))
  const totalItems = entries.filter((r) => r.name.trim() && Number(r.price) > 0).length

  return (
    <div className="min-h-screen bg-emerald-50">
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen">

        {/* 헤더 */}
        <div className="bg-emerald-600 text-white px-4 pt-4 pb-4">
          <div className="text-xs opacity-80 mb-0.5">반찬가게 관리</div>
          <h1 className="text-xl font-bold">💰 메뉴 판매가 관리</h1>
          <p className="text-xs opacity-75 mt-1">팩당 판매가를 등록하면 마감 시 매출이 자동 계산됩니다</p>
        </div>

        {/* 검색 + 등록 수 */}
        <div className="px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10 flex gap-2 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 메뉴명 검색"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 bg-gray-50"
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">{totalItems}개 등록</span>
        </div>

        {/* 컬럼 헤더 */}
        <div className="grid grid-cols-[1fr_100px_36px] gap-2 px-4 py-2 text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-100">
          <span>메뉴명</span>
          <span className="text-center">팩당 판매가(원)</span>
          <span></span>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
          {filtered.map((row) => (
            <div key={row.id} className="grid grid-cols-[1fr_100px_36px] gap-2 items-center">
              <input
                type="text"
                value={row.name}
                onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                placeholder="예: 시금치나물"
                className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full focus:outline-none focus:border-emerald-400"
              />
              <div className="relative">
                <input
                  type="number"
                  value={row.price}
                  onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                  placeholder="0"
                  className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-right w-full focus:outline-none focus:border-emerald-400 pr-7"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">원</span>
              </div>
              <button
                onClick={() => removeRow(row.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 text-xl transition-colors"
              >
                ×
              </button>
            </div>
          ))}

          <button
            onClick={addRow}
            className="mt-2 w-full border-2 border-dashed border-emerald-300 text-emerald-500 rounded-xl py-3 text-sm font-medium"
          >
            + 메뉴 추가
          </button>

          {/* 요약 카드 */}
          {totalItems > 0 && (
            <div className="mt-2 bg-white rounded-2xl p-4 border border-emerald-100">
              <div className="text-xs text-gray-500 mb-2">등록된 메뉴 판매가</div>
              <div className="space-y-1.5 max-h-40 overflow-auto">
                {entries
                  .filter((r) => r.name.trim() && Number(r.price) > 0)
                  .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
                  .map((r) => (
                    <div key={r.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">{r.name}</span>
                      <span className="font-semibold text-emerald-600">{Number(r.price).toLocaleString()}원</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="h-4" />
        </div>

        {/* 저장 버튼 */}
        <div className="px-4 py-4 bg-white border-t border-gray-100">
          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-md active:scale-95 transition-all ${
              saved ? 'bg-emerald-400' : 'bg-emerald-600'
            }`}
          >
            {saved ? '✓ 저장 완료!' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
