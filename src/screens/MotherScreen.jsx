import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getToday, formatDate, generateId } from '../utils/dataHelpers'

const DEFAULT_FAVORITES = ['시금치나물', '콩나물무침', '감자조림', '계란말이', '멸치볶음', '깍두기']

export default function MotherScreen({ onRoleChange }) {
  const today = getToday()
  const [productions, setProductions] = useLocalStorage('banchang_productions', {})
  const [ingredients, setIngredients] = useLocalStorage('banchang_ingredients', {})
  const [favorites, setFavorites] = useLocalStorage('banchang_favorites', DEFAULT_FAVORITES)

  const [items, setItems] = useState([])
  const [ingList, setIngList] = useState([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setItems(
      productions[today]?.length > 0 ? productions[today] : [newEmptyItem()]
    )
    setIngList(
      ingredients[today]?.length > 0 ? ingredients[today] : [newEmptyIng()]
    )
  }, [])

  function newEmptyItem(name = '') {
    return { id: generateId(), name }
  }

  function newEmptyIng(name = '') {
    return { id: generateId(), name, cost: '' }
  }

  // 제조 메뉴 관련
  function addItem(name = '') {
    setItems((prev) => [...prev, newEmptyItem(name)])
  }
  function removeItem(id) {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      return next.length === 0 ? [newEmptyItem()] : next
    })
  }
  function updateItem(id, field, value) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }
  function toggleFavorite(name) {
    if (!name.trim()) return
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    )
  }
  function addFromFavorite(name) {
    if (!items.find((i) => i.name === name)) addItem(name)
  }

  // 재료 구입 관련
  function addIng() {
    setIngList((prev) => [...prev, newEmptyIng()])
  }
  function removeIng(id) {
    setIngList((prev) => {
      const next = prev.filter((i) => i.id !== id)
      return next.length === 0 ? [newEmptyIng()] : next
    })
  }
  function updateIng(id, field, value) {
    setIngList((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  function handleSave() {
    const validItems = items.filter((i) => i.name.trim())
    if (validItems.length === 0) {
      alert('메뉴를 최소 1개 이상 입력해 주세요.')
      return
    }
    const parsedItems = validItems.map((i) => ({
      ...i,
      quantity: Number(i.quantity) || 0
    }))
    const parsedIngs = ingList
      .filter((i) => i.name.trim())
      .map((i) => ({ ...i, cost: Number(i.cost) || 0 }))

    setProductions((prev) => ({ ...prev, [today]: parsedItems }))
    setIngredients((prev) => ({ ...prev, [today]: parsedIngs }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalCost = ingList.reduce((s, i) => s + (Number(i.cost) || 0), 0)

  return (
    <div className="min-h-screen bg-green-50">
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen">
        {/* 헤더 */}
        <div className="bg-green-500 text-white px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80 mb-0.5">반찬가게 관리</div>
              <h1 className="text-xl font-bold">👩‍🍳 어머니 화면</h1>
            </div>
            <button
              onClick={onRoleChange}
              className="text-xs bg-white bg-opacity-20 px-3 py-1.5 rounded-full"
            >
              역할 변경
            </button>
          </div>
          <div className="mt-2 text-sm opacity-90">{formatDate(today)} 제조 입력</div>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4 space-y-5">
          {/* 즐겨찾기 */}
          {favorites.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-green-700 mb-2">⭐ 즐겨찾기 메뉴</div>
              <div className="flex flex-wrap gap-2">
                {favorites.map((name) => (
                  <button
                    key={name}
                    onClick={() => addFromFavorite(name)}
                    className="bg-white border border-green-300 text-green-700 text-sm px-3 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 제조 메뉴 목록 */}
          <div>
            <div className="text-sm font-semibold text-green-700 mb-2">🥘 오늘 제조 메뉴</div>
            <div className="grid grid-cols-[1fr_32px_32px] gap-1 px-1 mb-1 text-xs text-gray-400 font-medium">
              <span>메뉴명</span>
              <span></span>
              <span></span>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const isFav = favorites.includes(item.name)
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_32px_32px] gap-1 items-center">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      placeholder="메뉴명"
                      className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm w-full focus:outline-none focus:border-green-400"
                    />
                    <button
                      onClick={() => toggleFavorite(item.name)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${
                        isFav ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 text-xl transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => addItem()}
              className="mt-3 w-full border-2 border-dashed border-green-300 text-green-500 rounded-xl py-2.5 text-sm font-medium"
            >
              + 메뉴 추가
            </button>
          </div>

          {/* 재료 구입 목록 */}
          <div>
            <div className="text-sm font-semibold text-green-700 mb-2">🛒 오늘 재료 구입</div>
            <div className="grid grid-cols-[1fr_88px_32px] gap-1 px-1 mb-1 text-xs text-gray-400 font-medium">
              <span>재료명</span>
              <span className="text-center">금액(원)</span>
              <span></span>
            </div>
            <div className="space-y-2">
              {ingList.map((ing) => (
                <div key={ing.id} className="grid grid-cols-[1fr_88px_32px] gap-1 items-center">
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIng(ing.id, 'name', e.target.value)}
                    placeholder="예: 계란 1판"
                    className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm w-full focus:outline-none focus:border-green-400"
                  />
                  <input
                    type="number"
                    value={ing.cost}
                    onChange={(e) => updateIng(ing.id, 'cost', e.target.value)}
                    placeholder="0"
                    className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm text-center w-full focus:outline-none focus:border-green-400"
                  />
                  <button
                    onClick={() => removeIng(ing.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 text-xl transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addIng}
              className="mt-3 w-full border-2 border-dashed border-green-300 text-green-500 rounded-xl py-2.5 text-sm font-medium"
            >
              + 재료 추가
            </button>

            {/* 합계 */}
            <div className="mt-3 bg-white rounded-2xl p-4 border border-green-100">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>오늘 제조 메뉴 수</span>
                <span className="font-semibold">{items.filter(i => i.name.trim()).length}가지</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>오늘 총 재료비</span>
                <span className="font-semibold text-green-600">
                  {totalCost.toLocaleString('ko-KR')}원
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="px-4 py-4 safe-bottom">
          <button
            onClick={handleSave}
            className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-md active:scale-95 transition-all ${
              saved ? 'bg-green-400' : 'bg-green-500'
            }`}
          >
            {saved ? '✓ 저장 완료!' : '입력 완료'}
          </button>
        </div>
      </div>
    </div>
  )
}
