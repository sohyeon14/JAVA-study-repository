import { createClient } from '@/lib/supabase/server'
import { Classroom } from '@/types'
import Link from 'next/link'
import ClassroomManager from './ClassroomManager'

export default async function AdminClassroomsPage() {
  const supabase = await createClient()
  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('*')
    .order('name')

  return (
    <main className="max-w-3xl mx-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">교실 관리</h1>
          <p className="text-gray-500 mt-1">교실을 추가·수정·삭제할 수 있어요</p>
        </div>
        <Link href="/" className="text-blue-500 text-sm hover:underline">
          ← 교실 목록
        </Link>
      </div>

      <ClassroomManager initialClassrooms={(classrooms as Classroom[]) ?? []} />
    </main>
  )
}
