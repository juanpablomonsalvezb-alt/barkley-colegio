import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // Verificar CRON_SECRET
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const now = new Date().toISOString()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    // Buscar review_cards que estan pendientes de repaso (due_at <= now)
    const { data: dueCards, error: cardsError } = await admin
      .from('review_cards')
      .select('student_id, id')
      .lte('due_at', now)

    if (cardsError) {
      console.error('Error buscando review_cards:', cardsError)
      return NextResponse.json({ error: 'Error consultando tarjetas' }, { status: 500 })
    }

    if (!dueCards?.length) {
      return NextResponse.json({
        success: true,
        timestamp: now,
        studentsNotified: 0,
        totalPendingCards: 0,
      })
    }

    // Filtrar las que ya fueron revisadas hoy
    const cardIds = dueCards.map((c) => c.id)
    const { data: reviewedToday } = await admin
      .from('review_logs')
      .select('card_id')
      .in('card_id', cardIds)
      .gte('reviewed_at', todayStart.toISOString())

    const reviewedCardIds = new Set(reviewedToday?.map((r) => r.card_id) || [])
    const pendingCards = dueCards.filter((c) => !reviewedCardIds.has(c.id))

    // Agrupar por estudiante
    const studentCardCounts = new Map<string, number>()
    for (const card of pendingCards) {
      const count = studentCardCounts.get(card.student_id) || 0
      studentCardCounts.set(card.student_id, count + 1)
    }

    // Crear notificaciones por estudiante
    let studentsNotified = 0
    for (const [studentId, cardCount] of studentCardCounts) {
      await admin.from('notifications').insert({
        user_id: studentId,
        type: 'repaso_pendiente',
        title: 'Tienes repasos pendientes',
        message: `Tienes ${cardCount} tarjeta${cardCount > 1 ? 's' : ''} de repaso pendiente${cardCount > 1 ? 's' : ''}. Repasa ahora para mantener tu racha.`,
        data: { pending_count: cardCount },
      })
      studentsNotified++
    }

    return NextResponse.json({
      success: true,
      timestamp: now,
      studentsNotified,
      totalPendingCards: pendingCards.length,
    })
  } catch (error) {
    console.error('Error en cron spaced-repetition:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
