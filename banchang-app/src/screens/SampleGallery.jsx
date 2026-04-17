import { useState, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { generateId } from '../utils/dataHelpers'

export default function SampleGallery({ role, onBack }) {
  const [samples, setSamples] = useLocalStorage('banchang_samples', [])
  const [selected, setSelected] = useState(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newImage, setNewImage] = useState(null)
  const [search, setSearch] = useState('')
  const fileRef = useRef()

  const isAdmin = role === 'admin' || role === 'mother'

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      alert('사진 크기가 너무 큽니다. 3MB 이하로 올려주세요.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setNewImage(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleAdd() {
    if (!newName.trim()) { alert('메뉴명을 입력해 주세요.'); return }
    if (!newImage) { alert('사진을 선택해 주세요.'); return }
    setSamples((prev) => [
      ...prev,
      { id: generateId(), name: newName.trim(), desc: newDesc.trim(), image: newImage, createdAt: new Date().toLocaleDateString('ko-KR') }
    ])
    setNewName('')
    setNewDesc('')
    setNewImage(null)
    setAdding(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleDelete(id) {
    if (!confirm('이 사진을 삭제할까요?')) return
    setSamples((prev) => prev.filter((s) => s.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const filtered = samples.filter((s) => s.name.includes(search))

  return (
    <div className="min-h-screen bg-purple-50">
      <div className="w-full max-w-[430px] mx-auto flex flex-col min-h-screen">

        {/* 헤더 */}
        <div className="bg-purple-600 text-white px-4 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-white text-xl font-bold">←</button>
            <div className="flex-1">
              <div className="text-xs opacity-80 mb-0.5">반찬가게 관리</div>
              <h1 className="text-xl font-bold">📸 담음새 샘플 갤러리</h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setAdding(true)}
                className="bg-white bg-opacity-20 text-white text-sm px-3 py-1.5 rounded-full font-medium"
              >
                + 추가
              </button>
            )}
          </div>
          <div className="mt-3 text-xs opacity-75">직원들이 담음새 기준을 확인할 수 있습니다</div>
        </div>

        {/* 검색 */}
        <div className="px-4 py-2 bg-white border-b border-gray-200 sticky top-0 z-10">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 메뉴명 검색"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-gray-50"
          />
        </div>

        {/* 갤러리 그리드 */}
        <div className="flex-1 overflow-auto p-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📷</div>
              <div className="font-medium text-gray-500">
                {samples.length === 0 ? '아직 등록된 샘플 사진이 없습니다' : '검색 결과가 없습니다'}
              </div>
              {isAdmin && samples.length === 0 && (
                <button
                  onClick={() => setAdding(true)}
                  className="mt-4 bg-purple-500 text-white px-5 py-2.5 rounded-2xl font-medium text-sm"
                >
                  + 첫 번째 샘플 추가하기
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => setSelected(sample)}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={sample.image}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="font-semibold text-gray-800 text-sm truncate">{sample.name}</div>
                    {sample.desc && (
                      <div className="text-xs text-gray-400 mt-0.5 truncate">{sample.desc}</div>
                    )}
                    <div className="text-xs text-purple-400 mt-1">{sample.createdAt}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 사진 상세 모달 */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl overflow-hidden w-full max-w-[400px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img src={selected.image} alt={selected.name} className="w-full object-cover max-h-[60vh]" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 bg-black bg-opacity-50 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg"
              >
                ×
              </button>
            </div>
            <div className="px-5 py-4">
              <div className="text-lg font-bold text-gray-800">{selected.name}</div>
              {selected.desc && <div className="text-sm text-gray-500 mt-1">{selected.desc}</div>}
              <div className="text-xs text-gray-400 mt-2">등록일: {selected.createdAt}</div>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="mt-3 w-full py-2.5 rounded-xl bg-red-50 text-red-500 text-sm font-medium border border-red-100"
                >
                  🗑️ 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 사진 추가 모달 */}
      {adding && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] px-5 pt-5 pb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">📸 샘플 사진 추가</h2>
              <button onClick={() => { setAdding(false); setNewImage(null); setNewName(''); setNewDesc('') }} className="text-gray-400 text-2xl">×</button>
            </div>

            {/* 사진 선택 */}
            <div
              onClick={() => fileRef.current?.click()}
              className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer mb-4 transition-colors ${newImage ? 'border-purple-300' : 'border-gray-300 bg-gray-50'}`}
            >
              {newImage ? (
                <img src={newImage} alt="preview" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <>
                  <div className="text-3xl mb-2">📷</div>
                  <div className="text-sm text-gray-500 font-medium">탭하여 사진 선택</div>
                  <div className="text-xs text-gray-400 mt-1">PNG, JPG (최대 3MB)</div>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              ref={fileRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 메뉴명 */}
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700 mb-1 block">메뉴명 *</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="예: 시금치나물"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* 설명 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-700 mb-1 block">설명 (선택)</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="예: 참기름 2번, 깨 넉넉히"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-purple-400"
              />
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-4 rounded-2xl bg-purple-600 text-white font-bold text-base shadow-md active:scale-95 transition-all"
            >
              등록하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
