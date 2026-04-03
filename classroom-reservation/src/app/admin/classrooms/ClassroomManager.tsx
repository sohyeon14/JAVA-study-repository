'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Classroom } from '@/types'

type Props = {
  initialClassrooms: Classroom[]
}

const EMPTY_FORM = { name: '', capacity: 30, description: '' }

export default function ClassroomManager({ initialClassrooms }: Props) {
  const [classrooms, setClassrooms] = useState<Classroom[]>(initialClassrooms)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // 교실 추가
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase
      .from('classrooms')
      .insert({ ...form })
      .select()
      .single()

    if (error) {
      setError(error.message)
    } else {
      setClassrooms((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(EMPTY_FORM)
    }
    setLoading(false)
  }

  // 수정 시작
  function startEdit(classroom: Classroom) {
    setEditingId(classroom.id)
    setEditForm({
      name: classroom.name,
      capacity: classroom.capacity,
      description: classroom.description ?? '',
    })
  }

  // 수정 저장
  async function handleUpdate(id: string) {
    setError(null)
    setLoading(true)

    const { error } = await supabase
      .from('classrooms')
      .update({ ...editForm })
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setClassrooms((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...editForm } : c))
      )
      setEditingId(null)
    }
    setLoading(false)
  }

  // 삭제
  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" 교실을 삭제하면 관련 예약도 모두 삭제됩니다.\n정말 삭제할까요?`)) return
    setError(null)

    const { error } = await supabase.from('classrooms').delete().eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setClassrooms((prev) => prev.filter((c) => c.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* 교실 추가 폼 */}
      <form
        onSubmit={handleAdd}
        className="bg-white border border-sky-200 rounded-xl p-5 shadow-sm"
      >
        <h2 className="text-base font-semibold mb-4">새 교실 추가</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">교실 이름 *</label>
            <input
              type="text"
              required
              placeholder="예: 101호"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">수용 인원 *</label>
            <input
              type="number"
              required
              min={1}
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">설명</label>
            <input
              type="text"
              placeholder="예: 1층 일반 교실"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          + 추가
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* 교실 목록 */}
      <div className="bg-white border border-sky-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b bg-sky-50">
          <span className="text-sm font-semibold text-gray-700">
            전체 교실 ({classrooms.length}개)
          </span>
        </div>

        {classrooms.length === 0 && (
          <p className="text-center text-gray-400 py-10">등록된 교실이 없습니다.</p>
        )}

        <ul className="divide-y">
          {classrooms.map((classroom) => (
            <li key={classroom.id} className="px-5 py-4">
              {editingId === classroom.id ? (
                // 수정 모드
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="border rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    min={1}
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                    className="border rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="border rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="sm:col-span-3 flex gap-2 mt-1">
                    <button
                      onClick={() => handleUpdate(classroom.id)}
                      disabled={loading}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                // 보기 모드
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">{classroom.name}</span>
                    <span className="text-sm text-gray-400 ml-2">{classroom.capacity}명</span>
                    {classroom.description && (
                      <span className="text-sm text-gray-400 ml-2">· {classroom.description}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(classroom)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(classroom.id, classroom.name)}
                      className="text-sm text-red-400 hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
