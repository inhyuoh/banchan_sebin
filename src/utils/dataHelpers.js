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

/** 특정 날짜의 전체 요약 계산 (매출액은 점장이 직접 입력) */
export function calcDaySummary(revenue, ingredients, date) {
  const dayRevenue = revenue[date] || {}
  const dangsanRevenue = dayRevenue.dangsan || 0
  const jangsengRevenue = dayRevenue.jangseng || 0
  const totalRevenue = dangsanRevenue + jangsengRevenue
  const dayIngredients = (ingredients || {})[date] || []
  const totalCost = dayIngredients.reduce((sum, ing) => sum + (ing.cost || 0), 0)
  return {
    revenue: totalRevenue,
    cost: totalCost,
    profit: totalRevenue - totalCost,
    dangsanRevenue,
    jangsengRevenue
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

/** 고유 ID 생성 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

/** 점포 이름 반환 */
export function getStoreName(storeId) {
  return storeId === 'dangsan' ? '당산점' : '장승배기점'
}
