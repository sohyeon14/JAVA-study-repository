import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Classroom } from '@/types'

type Props = {
  searchParams: Promise<{ date?: string; classroom_id?: string }>
}

export default async function ReservationsPage({ searchParams }: Props) {
  const { date, classroom_id } = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const selectedDate = date ?? today

  const supabase = await createClient()

  // 교실 목록 (필터 드롭다운용)
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*')
    .order('name')

  // 예약 조회 (교실 + 날짜 필터)
  let query = supabase
    .from('reservations')
    .select('*, classrooms(name)')
    .eq('date', selectedDate)
    .order('start_time')

  if (classroom_id) {
    query = query.eq('classroom_id', classroom_id)
  }

  const { data: reservations, error } = await query

  const selectedClassroom = classrooms?.find((c: Classroom) => c.id === classroom_id)

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">예약 현황</h1>
          <p className="text-gray-500 mt-1">교실별, 날짜별 예약 현황을 확인하세요</p>
        </div>
        <Link href="/" className="text-blue-500 text-sm hover:underline">
          ← 교실 목록
        </Link>
      </div>

      {/* 필터 */}
      <form method="GET" className="bg-white border border-sky-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end shadow-sm">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">날짜</label>
          <input
            name="date"
            type="date"
            defaultValue={selectedDate}
            className="border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">교실</label>
          <select
            name="classroom_id"
            defaultValue={classroom_id ?? ''}
            className="border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">전체 교실</option>
            {classrooms?.map((c: Classroom) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          조회
        </button>

        {(classroom_id || selectedDate !== today) && (
          <Link href="/reservations" className="text-sm text-gray-400 hover:underline self-center">
            초기화
          </Link>
        )}
      </form>

      {/* 결과 헤더 */}
      <p className="text-sm font-medium text-gray-600 mb-4">
        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ko-KR', {
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
        })}
        {selectedClassroom && (
          <span className="ml-2 text-blue-600">· {selectedClassroom.name}</span>
        )}
        {!error && (
          <span className="ml-2 text-gray-400">({reservations?.length ?? 0}건)</span>
        )}
      </p>

      {error && (
        <p className="text-red-500 text-sm">데이터를 불러오지 못했습니다: {error.message}</p>
      )}

      {!error && reservations?.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📭</p>
          <p>해당 조건의 예약이 없습니다.</p>
        </div>
      )}

      <div className="space-y-3">
        {reservations?.map((r) => (
          <div key={r.id} className="bg-white border border-sky-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-blue-600">
                    {(r.classrooms as { name: string })?.name}
                  </span>
                  <span className="text-gray-400">·</span>
                  <span className="text-sm text-gray-600">
                    {r.start_time.slice(0, 5)} ~ {r.end_time.slice(0, 5)}
                  </span>
                </div>
                <p className="text-gray-800">{r.purpose}</p>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                {r.teacher_name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
