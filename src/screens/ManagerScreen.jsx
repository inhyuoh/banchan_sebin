import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getToday, formatDate, getStoreName, addDays } from '../utils/dataHelpers'

const DEFAULT_PRICES = {}

export default function ManagerScreen({ storeId }) {
  const today = getToday()
  const yesterday = addDays(today, -1)
  const storeName = getStoreName(storeId)

  const [productions] = useLocalStorage('banchang_productions', {})
  const [sales, setSales] = useLocalStorage('banchang_sales', {})
  const [revenue, setRevenue] = useLocalStorage('banchang_revenue', {})
  const [prices] = useLocalStorage('banchang_prices', DEFAULT_PRICES)

  const todayItems = productions[today] || []
  const todaySales = (sales[today] || {})[storeId] || {}
  const yesterdaySales = (sales[yesterday] || {})[storeId] || {}
  const yesterdayItems = productions[yesterday] || []

  const [tab, setTab] = useState('morning')
  const [entries, setEntries] = useState({})
  const [posRevenue, setPosRevenue] = useState('')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const init = {}
    todayItems.forEach((item) => {
      const ex = todaySales[item.id] || {}
      init[item.id] = {
        received: ex.received !== undefined ? String(ex.received) : '',
        remaining: ex.remaining !== undefined ? String(ex.remaining) : '',
        waste: ex.waste !== undefined ? String(ex.waste) : '0'
      }
    })
    setEntries(init)
    const saved = revenue[today]?.[storeId]
    if (saved) {
      setPosRevenue(String(saved.pos || ''))
    }
  }, [productions[today]])

  function step(menuId, field, delta) {
    setEntries((prev) => {
      const cur = Number(prev[menuId]?.[field]) || 0
      return { ...prev, [menuId]: { ...prev[menuId], [field]: String(Math.max(0, cur + delta)) } }
    })
  }

  function setField(menuId, field, value) {
    setEntries((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], [field]: String(Math.max(0, Number(value) || 0)) }
    }))
  }

  function getYesterdayRemaining(menuName) {
    const yItem = yesterdayItems.find((i) => i.name === menuName)
    if (!yItem) return 0
    const e = yesterdaySales[yItem.id] || {}
    if (e.remaining !== undefined) return Number(e.remaining) || 0
    return 0
  }

  function calcSold(item) {
    const e = entries[item.id] || {}
    const carryover = getYesterdayRemaining(item.name)
    const received = Number(e.received) || 0
    const remaining = Number(e.remaining) || 0
    const waste = Number(e.waste) || 0
    return Math.max(0, carryover + received - remaining - waste)
  }

  function getPrice(itemName) {
    return Number(prices[itemName]) || 0
  }

  // 계산 매출 합계
  const calcRevenue = todayItems.reduce((sum, item) => {
    return sum + calcSold(item) * getPrice(item.name)
  }, 0)

  const posRev = Number(posRevenue) || 0
  const revDiff = posRev - calcRevenue
  const isRevMismatch = posRev > 0 && calcRevenue > 0 && Math.abs(revDiff) / calcRevenue >= 0.05

  function handleSave() {
    const storeData = {}
    todayItems.forEach((item) => {
      const e = entries[item.id] || {}
      storeData[item.id] = {
        received: Number(e.received) || 0,
        remaining: Number(e.remaining) || 0,
        waste: Number(e.waste) || 0
      }
    })
    setSales((prev) => ({
      ...prev,
      [today]: { ...(prev[today] || {}), [storeId]: storeData }
    }))

    setRevenue((prev) => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        [storeId]: {
          calc: calcRevenue,
          pos: posRev || undefined
        }
      }
    }))

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const filtered = todayItems.filter((i) => i.name.includes(search))
  const totalReceived = Object.values(entries).reduce((s, e) => s + (Number(e.received) || 0), 0)
  const totalRemaining = Object.values(entries).reduce((s, e) => s + (Number(e.remaining) || 0), 0)
  const totalWaste = Object.values(entries).reduce((s, e) => s + (Number(e.waste) || 0), 0)

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen">

        {/* 헤더 */}
        <div className="bg-blue-500 text-white px-4 pt-4 pb-3">
          <div>
            <div className="text-xs opacity-80 mb-0.5">반찬가게 관리</div>
            <h1 className="text-xl font-bold">🏪 {storeName} 점장</h1>
          </div>
          <div className="mt-1.5 text-sm opacity-90">{formatDate(today)}</div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setTab('morning')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'morning' ? 'bg-white text-blue-600' : 'bg-white bg-opacity-20 text-white'}`}>
              🌅 아침 (소분 입력)
            </button>
            <button onClick={() => setTab('closing')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === 'closing' ? 'bg-white text-blue-600' : 'bg-white bg-opacity-20 text-white'}`}>
              🌙 마감 (재고·매출)
            </button>
          </div>
        </div>

        {/* 검색 */}
        <div className="px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 메뉴 검색"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
        </div>

        <div className="flex-1 overflow-auto">
          {todayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-medium">오늘 제조 데이터가 없습니다</div>
              <div className="text-sm mt-1">어머니가 메뉴를 입력하면 표시됩니다</div>
            </div>
          ) : (
            <>
              {/* ===== 아침 탭 ===== */}
              {tab === 'morning' && (
                <>
                  <div className="grid grid-cols-[1fr_120px] gap-2 px-4 py-2 text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-200">
                    <span>메뉴</span>
                    <span className="text-center">소분 팩 수</span>
                  </div>
                  {filtered.map((item) => {
                    const e = entries[item.id] || {}
                    const carryover = getYesterdayRemaining(item.name)
                    const price = getPrice(item.name)
                    return (
                      <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-800 truncate">{item.name}</div>
                          <div className="flex gap-2 mt-0.5">
                            {carryover > 0 && <span className="text-xs text-amber-600">📦 이월 {carryover}팩</span>}
                            {price > 0 && <span className="text-xs text-blue-400">{price.toLocaleString()}원/팩</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => step(item.id, 'received', -1)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 font-bold flex items-center justify-center active:scale-90">−</button>
                          <input type="number" value={e.received}
                            onChange={(ev) => setField(item.id, 'received', ev.target.value)}
                            placeholder="0"
                            className="w-12 border border-gray-200 rounded-lg py-1.5 text-sm text-center focus:outline-none focus:border-blue-400 bg-gray-50" />
                          <button onClick={() => step(item.id, 'received', 1)}
                            className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 font-bold flex items-center justify-center active:scale-90">+</button>
                        </div>
                        <span className="text-xs text-gray-400">팩</span>
                      </div>
                    )
                  })}
                </>
              )}

              {/* ===== 마감 탭 ===== */}
              {tab === 'closing' && (
                <>
                  {/* 메뉴별 재고·매출 */}
                  <div className="grid grid-cols-[1fr_56px_56px_56px] gap-1 px-4 py-2 text-xs text-gray-400 font-medium bg-gray-50 border-b border-gray-200">
                    <span>메뉴</span>
                    <span className="text-center">남은재고</span>
                    <span className="text-center">폐기</span>
                    <span className="text-center">판매</span>
                  </div>

                  {filtered.map((item) => {
                    const e = entries[item.id] || {}
                    const sold = calcSold(item)
                    const waste = Number(e.waste) || 0
                    const carryover = getYesterdayRemaining(item.name)
                    const received = Number(e.received) || 0
                    const available = carryover + received
                    const isHighWaste = available > 0 && waste / available >= 0.3
                    const price = getPrice(item.name)
                    const itemRevenue = sold * price

                    return (
                      <div key={item.id} className={`border-b border-gray-100 ${isHighWaste ? 'bg-red-50' : 'bg-white'}`}>
                        <div className="grid grid-cols-[1fr_56px_56px_56px] gap-1 px-4 py-3 items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-800 truncate">
                              {isHighWaste && '⚠️ '}{item.name}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">보유 {available}팩</div>
                          </div>

                          {/* 남은 재고 */}
                          <div className="flex flex-col items-center gap-0.5">
                            <button onClick={() => step(item.id, 'remaining', 1)}
                              className="w-7 h-6 rounded-md bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center active:scale-90">+</button>
                            <input type="number" value={e.remaining}
                              onChange={(ev) => setField(item.id, 'remaining', ev.target.value)}
                              placeholder="0"
                              className="w-full border border-gray-200 rounded-lg py-1 text-sm text-center focus:outline-none focus:border-blue-400 bg-gray-50" />
                            <button onClick={() => step(item.id, 'remaining', -1)}
                              className="w-7 h-6 rounded-md bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center active:scale-90">−</button>
                          </div>

                          {/* 폐기 */}
                          <div className="flex flex-col items-center gap-0.5">
                            <button onClick={() => step(item.id, 'waste', 1)}
                              className={`w-7 h-6 rounded-md font-bold text-sm flex items-center justify-center active:scale-90 ${isHighWaste ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600'}`}>+</button>
                            <input type="number" value={e.waste}
                              onChange={(ev) => setField(item.id, 'waste', ev.target.value)}
                              placeholder="0"
                              className={`w-full border rounded-lg py-1 text-sm text-center focus:outline-none ${isHighWaste ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50'}`} />
                            <button onClick={() => step(item.id, 'waste', -1)}
                              className="w-7 h-6 rounded-md bg-gray-100 text-gray-600 font-bold text-sm flex items-center justify-center active:scale-90">−</button>
                          </div>

                          {/* 판매 자동계산 */}
                          <div className="text-center">
                            <div className="text-base font-bold text-blue-600">{sold}</div>
                            <div className="text-xs text-gray-400">팩</div>
                            {price > 0 && (
                              <div className="text-xs text-green-600 font-medium mt-0.5">
                                {itemRevenue > 0 ? `${itemRevenue.toLocaleString()}원` : '-'}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* 계산 매출 요약 */}
                  <div className="mx-4 mt-4 mb-3 bg-blue-600 rounded-2xl p-4 text-white">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-semibold">📊 계산 매출</div>
                      <div className="text-xl font-bold">{calcRevenue.toLocaleString()}원</div>
                    </div>
                    <div className="text-xs opacity-75 mb-3">판매팩 × 판매가 자동합산</div>

                    {/* POS 정산 비교 */}
                    <div className="bg-white bg-opacity-15 rounded-xl p-3">
                      <div className="text-xs font-semibold mb-2">하나로마트 POS 정산액 (확인용)</div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={posRevenue} onChange={(e) => setPosRevenue(e.target.value)}
                          placeholder="0"
                          className="flex-1 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-xl px-3 py-2 text-white text-base font-bold placeholder-white placeholder-opacity-50 text-center focus:outline-none" />
                        <span className="text-sm font-medium">원</span>
                      </div>
                      {posRev > 0 && calcRevenue > 0 && (
                        <div className={`mt-2 text-xs font-semibold text-center py-1.5 rounded-lg ${isRevMismatch ? 'bg-red-400 bg-opacity-80' : 'bg-green-400 bg-opacity-60'}`}>
                          {isRevMismatch
                            ? `⚠️ 차이 ${Math.abs(revDiff).toLocaleString()}원 (${Math.round(Math.abs(revDiff) / calcRevenue * 100)}%)`
                            : '✓ 계산 매출과 일치'}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* 하단 요약 + 저장 */}
        {todayItems.length > 0 && (
          <div className="bg-white border-t border-gray-200 px-4 pt-3 pb-4 safe-bottom">
            {tab === 'morning' ? (
              <div className="flex justify-around mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400">오늘 소분</div>
                  <div className="font-bold text-blue-600">{totalReceived}팩</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">메뉴 수</div>
                  <div className="font-bold text-gray-700">{todayItems.length}가지</div>
                </div>
              </div>
            ) : (
              <div className="flex justify-around mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-400">남은 재고</div>
                  <div className="font-bold text-amber-600">{totalRemaining}팩</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">폐기</div>
                  <div className={`font-bold ${totalWaste > 0 ? 'text-red-500' : 'text-gray-400'}`}>{totalWaste}팩</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-400">계산 매출</div>
                  <div className="font-bold text-green-600 text-xs">{calcRevenue.toLocaleString()}원</div>
                </div>
              </div>
            )}
            <button onClick={handleSave}
              className={`w-full py-3.5 rounded-2xl font-bold text-white text-base shadow-md active:scale-95 transition-all ${saved ? 'bg-blue-400' : 'bg-blue-500'}`}>
              {saved ? '✓ 저장 완료!' : '저장'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
