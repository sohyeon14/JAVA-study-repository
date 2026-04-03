'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Reservation } from '@/types'

type Props = {
  classroomId: string
}

export default function ReservationForm({ classroomId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([])

  async function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const date = e.target.value
    if (!date) {
      setExistingReservations([])
      return
    }

    const supabase = createClient()
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('classroom_id', classroomId)
      .eq('date', date)
      .order('start_time')

    setExistingReservations(data ?? [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = e.currentTarget
    const data = {
      classroom_id: classroomId,
      teacher_name: (form.elements.namedItem('teacher_name') as HTMLInputElement).value,
      purpose: (form.elements.namedItem('purpose') as HTMLInputElement).value,
      date: (form.elements.namedItem('date') as HTMLInputElement).value,
      start_time: (form.elements.namedItem('start_time') as HTMLInputElement).value,
      end_time: (form.elements.namedItem('end_time') as HTMLInputElement).value,
    }

    if (data.start_time >= data.end_time) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error: supabaseError } = await supabase.from('reservations').insert(data)

    if (supabaseError) {
      if (supabaseError.code === '23P01') {
        setError('해당 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.')
      } else {
        setError(supabaseError.message)
      }
      setLoading(false)
      return
    }

    router.push(`/classrooms/${classroomId}/success`)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">선생님 이름</label>
          <input
            name="teacher_name"
            type="text"
            required
            placeholder="홍길동"
            className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">사용 목적</label>
          <input
            name="purpose"
            type="text"
            required
            placeholder="예: 1학년 수업, 동아리 활동"
            className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
          <input
            name="date"
            type="date"
            required
            min={new Date().toISOString().split('T')[0]}
            onChange={handleDateChange}
            className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
            <input
              name="start_time"
              type="time"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
            <input
              name="end_time"
              type="time"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '예약 중...' : '예약 신청'}
        </button>
      </form>

      {/* 해당 날짜 기존 예약 목록 */}
      {existingReservations.length > 0 && (
        <div className="bg-white border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            이 날 잡힌 예약 ({existingReservations.length}건)
          </h3>
          <div className="space-y-2">
            {existingReservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div>
                  <span className="font-medium text-gray-800">
                    {r.start_time.slice(0, 5)} ~ {r.end_time.slice(0, 5)}
                  </span>
                  <span className="text-gray-500 ml-2">{r.purpose}</span>
                </div>
                <span className="text-gray-400">{r.teacher_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {existingReservations.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          날짜를 선택하면 해당 날의 예약 현황을 확인할 수 있어요
        </p>
      )}
    </div>
  )
}
