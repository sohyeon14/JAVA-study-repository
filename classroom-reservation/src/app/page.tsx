import { createClient } from '@/lib/supabase/server'
import { Classroom } from '@/types'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: classrooms, error } = await supabase
    .from('classrooms')
    .select('*')
    .order('name')

  if (error) {
    return (
      <main className="max-w-4xl mx-auto p-8">
        <p className="text-red-500">교실 데이터를 불러오지 못했습니다: {error.message}</p>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold">교실 예약</h1>
        <div className="flex gap-4">
          <Link href="/reservations" className="text-blue-500 text-sm hover:underline">
            예약 현황 →
          </Link>
          <Link href="/admin/classrooms" className="text-gray-400 text-sm hover:underline">
            교실 관리
          </Link>
        </div>
      </div>
      <p className="text-gray-500 mb-8">예약할 교실을 선택하세요</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classrooms?.map((classroom: Classroom) => (
          <Link key={classroom.id} href={`/classrooms/${classroom.id}`}>
            <div className="bg-white border border-sky-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-sky-400 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">{classroom.name}</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {classroom.capacity}명
                </span>
              </div>
              {classroom.description && (
                <p className="text-gray-500 text-sm">{classroom.description}</p>
              )}
              <p className="mt-4 text-blue-500 text-sm font-medium">예약하기 →</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
