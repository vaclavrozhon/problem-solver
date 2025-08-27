import React, { useEffect, useState } from 'react'
import { signup, login, setKey, listProblems, createProblem, runRound, getStatus } from './api'

export default function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [problems, setProblems] = useState<string[]>([])
  const [newProblemName, setNewProblemName] = useState('toy')
  const [newProblemTask, setNewProblemTask] = useState('# Task\n')
  const [status, setStatus] = useState<any>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [rounds, setRounds] = useState(1)
  const [provers, setProvers] = useState(2)
  const [temperature, setTemperature] = useState(0.4)

  async function refresh() {
    const p = await listProblems()
    setProblems(p)
  }

  useEffect(() => { refresh() }, [])

  async function onSignup() {
    await signup(email, password)
    await refresh()
  }
  async function onLogin() {
    await login(email, password)
    await refresh()
  }
  async function onSetKey() {
    await setKey(apiKey)
    alert('API key saved')
  }
  async function onCreate() {
    await createProblem(newProblemName, newProblemTask, 'md')
    await refresh()
  }
  async function onRun() {
    if (!selected) return
    await runRound(selected, rounds, provers, temperature, 'gpt5')
    alert('Round started')
  }
  async function onCheck() {
    if (!selected) return
    const s = await getStatus(selected)
    setStatus(s)
  }

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2>Automatic Researcher</h2>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ minWidth: 320 }}>
          <h3>Auth</h3>
          <input placeholder='email' value={email} onChange={e=>setEmail(e.target.value)} />
          <input placeholder='password' type='password' value={password} onChange={e=>setPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button onClick={onSignup}>Sign up</button>
            <button onClick={onLogin}>Log in</button>
          </div>
          <h4 style={{ marginTop: 16 }}>OpenAI API key</h4>
          <input placeholder='sk-...' value={apiKey} onChange={e=>setApiKey(e.target.value)} />
          <div>
            <button onClick={onSetKey}>Save key</button>
          </div>
          <h3 style={{ marginTop: 24 }}>Problems</h3>
          <div>
            <input placeholder='new problem name' value={newProblemName} onChange={e=>setNewProblemName(e.target.value)} />
            <textarea rows={6} value={newProblemTask} onChange={e=>setNewProblemTask(e.target.value)} />
            <div><button onClick={onCreate}>Create</button></div>
          </div>
          <ul>
            {problems.map(p => (
              <li key={p}>
                <a href='#' onClick={() => setSelected(p)}>{p}</a>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h3>Selected: {selected || '—'}</h3>
          {selected && (
            <div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <label>Rounds</label>
                <input type='number' min={1} value={rounds} onChange={e=>setRounds(parseInt(e.target.value||'1'))} />
                <label>Provers</label>
                <input type='number' min={1} max={10} value={provers} onChange={e=>setProvers(parseInt(e.target.value||'2'))} />
                <label>Temp</label>
                <input type='number' step='0.05' min={0} max={1} value={temperature} onChange={e=>setTemperature(parseFloat(e.target.value||'0.4'))} />
                <button onClick={onRun}>Run round</button>
                <button onClick={onCheck}>Check status</button>
              </div>
              <pre style={{ background: '#f6f8fa', padding: 8, borderRadius: 6 }}>{JSON.stringify(status, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

