import { useState, useEffect } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { useLocalStorage } from '../hooks/useLocalStorage'
import {
  getToday, formatDate, addDays, formatCurrency,
  calcDaySummary, buildChartData, getLastNDates,
  calcTheoreticalRevenue, DEFAULT_PRICES
} from '../utils/dataHelpers'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-orange-200 rounded-xl px-3 py-2 shadow-md text-sm">
        <div className="text-gray-500 mb-1">{label}</div>
        <div className="font-bold text-orange-600">{formatCurrency(payload[0].value)}</div>
      </div>
    )
  }
  return null
}

export default function AdminDashboard() {
  const today = getToday()
  const [selectedDate, setSelectedDate] = useState(today)
  const [chartMode, setChartMode] = useState('weekly')

  const [productions] = useLocalStorage('banchang_productions', {})
  const [sales] = useLocalStorage('banchang_sales', {})
  const [revenue] = useLocalStorage('banchang_revenue', {})
  const [ingredients] = useLocalStorage('banchang_ingredients', {})
  const [prices, setPrices] = useLocalStorage('banchang_prices', DEFAULT_PRICES)
  const [showPricePanel, setShowPricePanel] = useState(false)
  const [priceEdits, setPriceEdits] = useState({})

  useEffect(() => {
    // 기본 가격이 없으면 세팅
    setPrices((prev) => ({ ...DEFAULT_PRICES, ...prev }))
  }, [])

  function savePrices() {
    setPrices((prev) => {
      const next = { ...prev }
      Object.entries(priceEdits).forEach(([name, val]) => {
        const n = Number(val)
        if (n > 0) next[name] = n
      })
      return next
    })
    setPriceEdits({})
    setShowPricePanel(false)
  }

  const summary = calcDaySummary(revenue, ingredients, selectedDate)
  const todayItems = productions[selectedDate] || []
  const todaySalesAll = sales[selectedDate] || {}

  const chartDates = getLastNDates(today, chartMode === 'weekly' ? 7 : 30)
  const chartData = buildChartData(revenue, ingredients, chartDates)

  function prevDay() { setSelectedDate((d) => addDays(d, -1)) }
  function nextDay() {
    const next = addDays(selectedDate, 1)
    if (next <= today) setSelectedDate(next)
  }

  // 이론 매출 계산
  const theoreticalDangsan = calcTheoreticalRevenue(productions, sales, prices, selectedDate, 'dangsan')
  const theoreticalJangseng = calcTheoreticalRevenue(productions, sales, prices, selectedDate, 'jangseng')
  const theoreticalTotal = theoreticalDangsan + theoreticalJangseng
  const revenueDiff = summary.revenue - theoreticalTotal
  const diffRate = theoreticalTotal > 0 ? Math.round(Math.abs(revenueDiff) / theoreticalTotal * 100) : 0
  const isRevenueSuspicious = theoreticalTotal > 0 && diffRate >= 10

  // 메뉴별 폐기 현황
  function getMenuWasteData() {
    return todayItems.map((item) => {
      const totalReceived = Object.values(todaySalesAll).reduce((sum, storeSales) => {
        return sum + (storeSales[item.id]?.received || 0)
      }, 0)
      const totalWaste = Object.values(todaySalesAll).reduce((sum, storeSales) => {
        return sum + (storeSales[item.id]?.waste || 0)
      }, 0)
      const totalRemaining = Object.values(todaySalesAll).reduce((sum, storeSales) => {
        return sum + (storeSales[item.id]?.remaining || 0)
      }, 0)
      const totalSold = Math.max(0, totalReceived - totalRemaining - totalWaste)
      const wasteRate = totalReceived > 0 ? Math.round((totalWaste / totalReceived) * 100) : 0
      return { ...item, totalReceived, totalWaste, totalRemaining, totalSold, wasteRate }
    })
  }

  const menuWasteData = getMenuWasteData()

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen">

        {/* 헤더 */}
        <div className="bg-orange-500 text-white px-4 pt-4 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs opacity-80 mb-0.5">반찬가게 관리</div>
              <h1 className="text-xl font-bold">📊 관리자 대시보드</h1>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-4 py-4 space-y-4">

          {/* 날짜 선택 */}
          <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-orange-100 shadow-sm">
            <button onClick={prevDay} className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 text-xl font-bold active:scale-90">‹</button>
            <div className="text-center">
              <div className="font-semibold text-gray-800 text-sm">{formatDate(selectedDate)}</div>
              {selectedDate === today && <div className="text-xs text-orange-500 mt-0.5">오늘</div>}
            </div>
            <button onClick={nextDay} disabled={selectedDate >= today}
              className={`w-9 h-9 flex items-center justify-center rounded-xl text-xl font-bold active:scale-90 ${selectedDate >= today ? 'text-gray-300 bg-gray-50' : 'bg-orange-50 text-orange-600'}`}>›</button>
          </div>

          {/* 일일 요약 */}
          <div>
            <div className="text-sm font-semibold text-orange-700 mb-2">일일 요약</div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="bg-white rounded-2xl p-4 border border-orange-100">
                <div className="text-xs text-gray-500 mb-1">총 매출</div>
                <div className="font-bold text-gray-800">{formatCurrency(summary.revenue)}</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-red-100">
                <div className="text-xs text-gray-500 mb-1">총 재료비</div>
                <div className="font-bold text-gray-800">{formatCurrency(summary.cost)}</div>
              </div>
            </div>
            <div className={`bg-white rounded-2xl p-4 border ${summary.profit >= 0 ? 'border-green-200' : 'border-red-200'}`}>
              <div className="text-xs text-gray-500 mb-1">순수익</div>
              <div className={`font-bold text-2xl ${summary.profit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {summary.profit >= 0 ? '+' : ''}{formatCurrency(summary.profit)}
              </div>
            </div>
          </div>

          {/* 이론 vs 실제 매출 비교 */}
          {theoreticalTotal > 0 && (
            <div>
              <div className="text-sm font-semibold text-orange-700 mb-2">🔍 매출 검증</div>
              <div className={`rounded-2xl p-4 border ${isRevenueSuspicious ? 'bg-red-50 border-red-300' : 'bg-white border-green-200'}`}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">이론 매출 (수량×판매가)</span>
                  <span className="font-semibold">{formatCurrency(theoreticalTotal)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">실제 매출 (정산액)</span>
                  <span className="font-semibold">{formatCurrency(summary.revenue)}</span>
                </div>
                <div className={`flex justify-between text-sm font-bold pt-2 border-t ${isRevenueSuspicious ? 'border-red-200 text-red-600' : 'border-gray-100 text-green-600'}`}>
                  <span>{isRevenueSuspicious ? '⚠️ 차이 발생' : '✓ 정상'}</span>
                  <span>{revenueDiff >= 0 ? '+' : ''}{formatCurrency(revenueDiff)} ({diffRate}%)</span>
                </div>
                {isRevenueSuspicious && (
                  <div className="mt-2 text-xs text-red-500">
                    이론 매출 대비 {diffRate}% 차이가 납니다. 수량 입력을 확인해주세요.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 점포별 매출 */}
          <div>
            <div className="text-sm font-semibold text-orange-700 mb-2">점포별 매출</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-2xl p-4 border border-blue-100">
                <div className="text-xs text-gray-500 mb-1">🏪 당산점</div>
                <div className="font-bold text-gray-800">{formatCurrency(summary.dangsanRevenue)}</div>
                {summary.revenue > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.round(summary.dangsanRevenue / summary.revenue * 100)}%
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl p-4 border border-blue-100">
                <div className="text-xs text-gray-500 mb-1">🏬 장승배기점</div>
                <div className="font-bold text-gray-800">{formatCurrency(summary.jangsengRevenue)}</div>
                {summary.revenue > 0 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {Math.round(summary.jangsengRevenue / summary.revenue * 100)}%
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 메뉴별 폐기 현황 */}
          {todayItems.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-orange-700 mb-2">메뉴별 재고 현황</div>
              <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
                <div className="grid grid-cols-[1fr_44px_44px_44px_52px] px-3 py-2 text-xs text-gray-400 font-medium border-b border-gray-100">
                  <span>메뉴</span>
                  <span className="text-center">소분</span>
                  <span className="text-center">판매</span>
                  <span className="text-center">폐기</span>
                  <span className="text-center">폐기율</span>
                </div>
                {menuWasteData.map((item, idx) => {
                  const isHighWaste = item.wasteRate >= 30
                  return (
                    <div key={item.id}
                      className={`grid grid-cols-[1fr_44px_44px_44px_52px] px-3 py-2.5 text-sm border-b border-gray-50 ${isHighWaste ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <span className={`font-medium truncate ${isHighWaste ? 'text-red-700' : 'text-gray-800'}`}>
                        {isHighWaste && '⚠️ '}{item.name}
                      </span>
                      <span className="text-center text-gray-600">{item.totalReceived}</span>
                      <span className="text-center text-gray-600">{item.totalSold}</span>
                      <span className={`text-center ${isHighWaste ? 'text-red-600 font-medium' : 'text-gray-600'}`}>{item.totalWaste}</span>
                      <span className={`text-center font-semibold ${isHighWaste ? 'text-red-600' : item.wasteRate >= 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {item.totalReceived > 0 ? `${item.wasteRate}%` : '-'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {todayItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400">
              <div className="text-3xl mb-2">📭</div>
              <div className="text-sm">해당 날짜의 데이터가 없습니다</div>
            </div>
          )}

          {/* 판매가 관리 */}
          <div>
            <button
              onClick={() => { setShowPricePanel((v) => !v); setPriceEdits({}) }}
              className="w-full flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-orange-100 text-sm font-semibold text-orange-700"
            >
              <span>💰 메뉴 판매가 관리</span>
              <span>{showPricePanel ? '▲' : '▼'}</span>
            </button>
            {showPricePanel && (
              <div className="bg-white rounded-2xl border border-orange-100 mt-2 overflow-hidden">
                <div className="px-4 py-2 text-xs text-gray-400 bg-gray-50 border-b border-gray-100">
                  메뉴명을 탭해서 가격 수정 가능 · 저장 전까지 반영 안 됨
                </div>
                {Object.entries({ ...prices, ...(Object.fromEntries(todayItems.map(i => [i.name, prices[i.name] || 0]))) })
                  .sort((a, b) => a[0].localeCompare(b[0], 'ko'))
                  .map(([name, price]) => (
                    <div key={name} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50">
                      <span className="flex-1 text-sm text-gray-800">{name}</span>
                      <input
                        type="number"
                        value={priceEdits[name] !== undefined ? priceEdits[name] : String(price || '')}
                        onChange={(e) => setPriceEdits((p) => ({ ...p, [name]: e.target.value }))}
                        placeholder="0"
                        className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-orange-400"
                      />
                      <span className="text-xs text-gray-400">원/팩</span>
                    </div>
                  ))}
                <div className="px-4 py-3">
                  <button onClick={savePrices} className="w-full bg-orange-500 text-white rounded-xl py-2.5 text-sm font-bold">
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 순수익 그래프 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-orange-700">순수익 추이</div>
              <div className="flex gap-1">
                <button onClick={() => setChartMode('weekly')}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${chartMode === 'weekly' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  주간
                </button>
                <button onClick={() => setChartMode('monthly')}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${chartMode === 'monthly' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  월간
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-orange-100 p-4">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} interval={chartMode === 'monthly' ? 6 : 0} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 1000)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="순수익" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="h-4" />
        </div>
      </div>
    </div>
  )
}
