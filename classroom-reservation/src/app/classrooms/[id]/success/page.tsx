import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SuccessPage({ params }: Props) {
  const { id } = await params

  return (
    <main className="max-w-2xl mx-auto p-8 text-center mt-16">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-2xl font-bold mb-2">예약이 완료됐습니다!</h1>
      <p className="text-gray-500 mb-8">예약 내용은 예약 현황에서 확인할 수 있어요.</p>

      <div className="flex gap-3 justify-center">
        <Link
          href={`/classrooms/${id}`}
          className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          같은 교실 다시 예약
        </Link>
        <Link
          href="/"
          className="px-5 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          교실 목록으로
        </Link>
      </div>
    </main>
  )
}
