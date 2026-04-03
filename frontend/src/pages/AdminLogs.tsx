import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import './Admin.css'

type LogCategory = 'all' | 'withdraw' | 'deposit' | 'balance' | 'security' | 'gift_code' | 'checkin' | 'vip' | 'cycle' | 'other'

type AdminLog = {
  id: number
  userId: number | null
  userName: string | null
  userPhone: string | null
  entityType: string
  entityId: number | null
  action: string
  category: Exclude<LogCategory, 'all'>
  oldBalance: number | null
  newBalance: number | null
  amount: number | null
  metadata: string | null
  createdAt: string | null
}

type LogsResponse = {
  ok?: boolean
  total?: number
  logs?: AdminLog[]
  grouped?: Record<string, AdminLog[]>
  error?: string
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333'

const CATEGORY_LABEL: Record<LogCategory, string> = {
  all: 'Todos',
  withdraw: 'Saques',
  deposit: 'Depósitos',
  balance: 'Ajustes de Saldo',
  security: 'Segurança',
  gift_code: 'Gift Codes',
  checkin: 'Check-in',
  vip: 'VIP',
  cycle: 'Ciclos',
  other: 'Outros',
}

const formatBRL = (value: number) =>
  Number(value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const safeJson = (value: string | null) => {
  if (!value) return null
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

export default function AdminLogs() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [error, setError] = useState('')
  const [category, setCategory] = useState<LogCategory>('all')

  const token = useMemo(
    () => localStorage.getItem('token') ?? sessionStorage.getItem('token') ?? '',
    []
  )

  useEffect(() => {
    if (!token) {
      navigate('/')
      return
    }

    const loadLogs = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_URL}/api/admin/logs?category=${encodeURIComponent(category)}&limit=500`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = (await res.json()) as LogsResponse
        if (!res.ok || !data?.ok) {
          setError(data?.error || 'Não foi possível carregar os logs.')
          setLogs([])
          return
        }
        setLogs(Array.isArray(data.logs) ? data.logs : [])
      } catch {
        setError('Erro de conexão ao carregar logs.')
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [category, navigate, token])

  const grouped = useMemo(() => {
    const map: Record<string, AdminLog[]> = {}
    for (const item of logs) {
      const key = item.category
      if (!map[key]) map[key] = []
      map[key].push(item)
    }
    return map
  }, [logs])

  const orderedCategories: Exclude<LogCategory, 'all'>[] = [
    'withdraw',
    'deposit',
    'balance',
    'security',
    'gift_code',
    'checkin',
    'vip',
    'cycle',
    'other',
  ]

  return (
    <main className="admin-page">
      <AdminSidebar />
      <header className="admin-header">
        <div>
          <p className="admin-kicker">Admin</p>
          <h1>Logs do Sistema</h1>
          <span className="admin-subtitle">Visualização organizada por categorias</span>
        </div>
        <div className="admin-header-actions">
          <button type="button" onClick={() => navigate('/adf')}>Voltar</button>
        </div>
      </header>

      <section className="admin-panel admin-user-list-panel">
        <div className="admin-log-header">
          <h3>Filtro de categoria</h3>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(Object.keys(CATEGORY_LABEL) as LogCategory[]).map((item) => (
            <button
              key={item}
              type="button"
              className="admin-toggle-logs-btn"
              style={{ opacity: category === item ? 1 : 0.75 }}
              onClick={() => setCategory(item)}
            >
              {CATEGORY_LABEL[item]}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <section className="admin-panel admin-user-list-panel">
          <p>Carregando logs...</p>
        </section>
      ) : error ? (
        <section className="admin-panel admin-user-list-panel">
          <p>{error}</p>
        </section>
      ) : (
        orderedCategories
          .filter((cat) => category === 'all' ? (grouped[cat]?.length ?? 0) > 0 : cat === category)
          .map((cat) => (
            <section key={cat} className="admin-panel admin-user-list-panel">
              <div className="admin-log-header">
                <h3>{CATEGORY_LABEL[cat]} ({grouped[cat]?.length ?? 0})</h3>
              </div>

              {(grouped[cat]?.length ?? 0) === 0 ? (
                <p className="admin-log-hint">Sem registros nesta categoria.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Mensagem</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Usuário</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Entidade</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Saldo antigo</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Saldo novo</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Valor</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Metadata</th>
                        <th style={{ textAlign: 'left', padding: '8px 6px' }}>Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(grouped[cat] ?? []).map((log) => {
                        const metadata = safeJson(log.metadata)
                        return (
                          <tr key={log.id} style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <td style={{ padding: '8px 6px' }}>{log.action}</td>
                            <td style={{ padding: '8px 6px' }}>{log.userId ?? '-'}</td>
                            <td style={{ padding: '8px 6px' }}>{log.entityType}#{log.entityId ?? '-'}</td>
                            <td style={{ padding: '8px 6px' }}>{log.oldBalance == null ? '-' : formatBRL(log.oldBalance)}</td>
                            <td style={{ padding: '8px 6px' }}>{log.newBalance == null ? '-' : formatBRL(log.newBalance)}</td>
                            <td style={{ padding: '8px 6px' }}>{log.amount == null ? '-' : formatBRL(log.amount)}</td>
                            <td style={{ padding: '8px 6px', maxWidth: 320 }}>
                              {metadata ? (
                                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                                  {typeof metadata === 'string' ? metadata : JSON.stringify(metadata, null, 2)}
                                </pre>
                              ) : '-'}
                            </td>
                            <td style={{ padding: '8px 6px' }}>
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('pt-BR') : '-'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))
      )}
    </main>
  )
}
