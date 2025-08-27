import React, { useEffect, useState } from 'react'
import { getStatus } from './api'
import Markdown from './Markdown'

type Props = { name: string }

export default function ProblemDetail({ name }: Props) {
  const [status, setStatus] = useState<any>(null)

  async function refresh() {
    const s = await getStatus(name)
    setStatus(s)
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 4000)
    return () => clearInterval(t)
  }, [name])

  return (
    <div>
      <h3>{name}</h3>
      <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 6 }}>{JSON.stringify(status, null, 2)}</pre>
    </div>
  )
}

