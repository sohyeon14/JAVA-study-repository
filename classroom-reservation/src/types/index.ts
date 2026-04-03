// 교실
export type Classroom = {
  id: string
  name: string        // 예: "101호", "과학실"
  capacity: number    // 수용 인원
  description: string | null
  created_at: string
}

// 예약
export type Reservation = {
  id: string
  classroom_id: string
  teacher_name: string
  purpose: string     // 예약 목적 (예: "1학년 수업", "동아리 활동")
  date: string        // YYYY-MM-DD
  start_time: string  // HH:MM
  end_time: string    // HH:MM
  created_at: string
}

// 예약 생성 시 사용 (id, created_at 제외)
export type CreateReservation = Omit<Reservation, 'id' | 'created_at'>
