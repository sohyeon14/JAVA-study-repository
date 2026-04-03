import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReservationForm from './ReservationForm'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ClassroomPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', id)
    .single()

  if (!classroom) notFound()

  return (
    <main className="max-w-2xl mx-auto p-8">
      <Link href="/" className="text-blue-500 text-sm mb-6 inline-block hover:underline">
        ← 교실 목록으로
      </Link>

      <div className="bg-white border rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{classroom.name}</h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {classroom.capacity}명
          </span>
        </div>
        {classroom.description && (
          <p className="text-gray-500 mt-1">{classroom.description}</p>
        )}
      </div>

      <h2 className="text-lg font-semibold mb-4">예약 신청</h2>
      <ReservationForm classroomId={id} />
    </main>
  )
}
