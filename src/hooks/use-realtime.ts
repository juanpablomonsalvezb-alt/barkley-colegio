'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RealtimeFilter {
  column: string
  value: string
}

export function useRealtime<T extends { id: string }>(
  table: string,
  filter?: RealtimeFilter
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchInitial() {
      try {
        let query = supabase.from(table).select('*')

        if (filter) {
          query = query.eq(filter.column, filter.value)
        }

        const { data, error: queryError } = await query

        if (queryError) throw queryError
        setItems((data as T[]) || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitial()

    const channelName = filter
      ? `${table}_${filter.column}_${filter.value}`
      : `${table}_all`

    const channelConfig: {
      event: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
      schema: string
      table: string
      filter?: string
    } = {
      event: '*',
      schema: 'public',
      table,
    }

    if (filter) {
      channelConfig.filter = `${filter.column}=eq.${filter.value}`
    }

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', channelConfig, (payload) => {
        if (payload.eventType === 'INSERT') {
          setItems((prev) => [...prev, payload.new as T])
        } else if (payload.eventType === 'UPDATE') {
          setItems((prev) =>
            prev.map((item) =>
              item.id === (payload.new as T).id ? (payload.new as T) : item
            )
          )
        } else if (payload.eventType === 'DELETE') {
          setItems((prev) =>
            prev.filter((item) => item.id !== (payload.old as T).id)
          )
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter?.column, filter?.value])

  return { items, loading, error }
}
