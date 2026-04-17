/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
export function getToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** YYYY-MM-DD → X월 Y일 (요일) */
export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dow = days[date.getDay()]
  return `${month}월 ${day}일 (${dow})`
}

/** YYYY-MM-DD → MM/DD */
export function formatShortDate(dateStr) {
  const [, mm, dd] = dateStr.split('-')
  return `${parseInt(mm)}/${parseInt(dd)}`
}

/** 날짜에 days를 더한 YYYY-MM-DD 반환 */
export function addDays(dateStr, days) {
  const date = new Date(dateStr + 'T00:00:00')
  date.setDate(date.getDate() + days)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

/** 숫자를 한국 통화 형식으로 변환 (예: 12,500원) */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0원'
  return Math.round(amount).toLocaleString('ko-KR') + '원'
}

/** 폐기율 계산 (%) */
export function calcWasteRate(waste, quantity) {
  if (!quantity || quantity === 0) return 0
  return Math.round((waste / quantity) * 100)
}

/** 마지막 N일의 날짜 배열 반환 (endDate 포함) */
export function getLastNDates(endDate, n) {
  const dates = []
  for (let i = n - 1; i >= 0; i--) {
    dates.push(addDays(endDate, -i))
  }
  return dates
}

/** revenue[date][storeId]에서 계산 매출 추출 (구형: 숫자, 신형: {calc, pos}) */
function getStoreRevenue(dayRevenue, storeId) {
  const v = dayRevenue[storeId]
  if (!v) return { calc: 0, pos: 0 }
  if (typeof v === 'number') return { calc: v, pos: v }
  return { calc: v.calc || 0, pos: v.pos || 0 }
}

/** 특정 날짜의 전체 요약 계산 */
export function calcDaySummary(revenue, ingredients, date) {
  const dayRevenue = revenue[date] || {}
  const dangsan = getStoreRevenue(dayRevenue, 'dangsan')
  const jangseng = getStoreRevenue(dayRevenue, 'jangseng')
  const dangsanRevenue = dangsan.calc
  const jangsengRevenue = jangseng.calc
  const totalRevenue = dangsanRevenue + jangsengRevenue
  const dangsanPos = dangsan.pos
  const jangsengPos = jangseng.pos
  const totalPos = dangsanPos + jangsengPos
  const dayIngredients = (ingredients || {})[date] || []
  const totalCost = dayIngredients.reduce((sum, ing) => sum + (ing.cost || 0), 0)
  return {
    revenue: totalRevenue,
    pos: totalPos,
    cost: totalCost,
    profit: totalRevenue - totalCost,
    dangsanRevenue,
    jangsengRevenue,
    dangsanPos,
    jangsengPos
  }
}

/** 날짜 범위의 순수익 차트 데이터 생성 */
export function buildChartData(revenue, ingredients, dates) {
  return dates.map((date) => {
    const { profit } = calcDaySummary(revenue, ingredients, date)
    return {
      date: formatShortDate(date),
      순수익: profit
    }
  })
}

/** 이론 매출 계산 (소분 - 남은재고 - 폐기) × 판매가 */
export function calcTheoreticalRevenue(productions, sales, prices, date, storeId) {
  const dayItems = productions[date] || []
  const storeSales = (sales[date] || {})[storeId] || {}
  return dayItems.reduce((sum, item) => {
    const e = storeSales[item.id] || {}
    const sold = Math.max(0, (Number(e.received) || 0) - (Number(e.remaining) || 0) - (Number(e.waste) || 0))
    return sum + sold * (prices[item.name] || 0)
  }, 0)
}

/** 기본 판매가 */
export const DEFAULT_PRICES = {
  '김치': 8000,
  '콩나물': 3000,
  '두부': 3500
}

/** 고유 ID 생성 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** 점포 이름 반환 */
export function getStoreName(storeId) {
  return storeId === 'dangsan' ? '당산점' : '장승배기점'
}
