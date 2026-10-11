'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Batch, Product } from '@/types'
import Tooltip from '@/components/ui/Tooltip'

// ── SVG иконки ──────────────────────────────────────────────
const IconSearch = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconPlus   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconEdit   = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconDelete = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
const IconClose  = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

// ── Форматирование ───────────────────────────────────────────
function fmtRub(n: number | string | null | undefined) {
  const num = Number(n)
  if (!n && n !== 0) return '—'
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(num) + ' ₽'
}
function fmtCny(n: number | string | null | undefined) {
  const num = Number(n)
  if (!n && n !== 0) return '—'
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(num) + ' ¥'
}

// ── Начальное состояние формы ────────────────────────────────
const EMPTY_FORM = {
  batch_number:       '',
  product_id:         '',
  quantity:           '',
  price_exw_cny:      '',
  cny_rate:           '',
  cny_rate_date:      new Date().toISOString().split('T')[0],
  customs_duty_pct:   '0',
  transport_cost:     '0',
  other_costs:        '0',
  markup_coefficient: '1.25',
  gtd_number:         '',
  gtd_date:           '',
}

type FormState = typeof EMPTY_FORM

export default function BatchesPage() {
  const [batches, setBatches]   = useState<Batch[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  const [products, setProducts] = useState<Product[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [showProductList, setShowProductList] = useState(false)

  const [panelOpen, setPanelOpen] = useState(false)
  const [editing, setEditing]     = useState<Batch | null>(null)
  const [form, setForm]           = useState<FormState>({ ...EMPTY_FORM })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState('')

  // ── Загрузка партий ────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p   = new URLSearchParams({ search, limit: '100' })
      const res = await fetch(`/api/batches?${p}`)
      const json = await res.json()
      setBatches(json.data || [])
      setTotal(json.total || 0)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  // ── Загрузка товаров для выбора ────────────────────────────
  useEffect(() => {
    fetch('/api/products?limit=200&status=active')
      .then(r => r.json())
      .then(j => setProducts(j.data || []))
  }, [])

  const filteredProducts = useMemo(() =>
    products.filter(p =>
      p.auteko_article.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    ).slice(0, 10),
    [products, productSearch]
  )

  // ── Живой расчёт себестоимости ─────────────────────────────
  const calc = useMemo(() => {
    const buy      = parseFloat(form.price_exw_cny)   || 0
    const rate     = parseFloat(form.cny_rate)         || 0
    const qty      = parseInt(form.quantity)            || 1
    const duty     = parseFloat(form.customs_duty_pct) || 0
    const ship     = parseFloat(form.transport_cost)   || 0
    const other    = parseFloat(form.other_costs)      || 0
    const markup   = parseFloat(form.markup_coefficient) || 1

    if (!buy || !rate) return null

    const exwRub    = buy * rate
    const dutyAmt   = exwRub * (duty / 100)
    const perUnit   = (ship + other) / qty
    const costPrice = exwRub + dutyAmt + perUnit
    const kpPrice   = costPrice * markup
    const profit    = kpPrice - costPrice

    return { exwRub, dutyAmt, perUnit, costPrice, kpPrice, profit }
  }, [form.price_exw_cny, form.cny_rate, form.quantity, form.customs_duty_pct, form.transport_cost, form.other_costs, form.markup_coefficient])

  // ── Панель ─────────────────────────────────────────────────
  function openCreate() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setProductSearch('')
    setFormError('')
    setPanelOpen(true)
  }

  function openEdit(b: Batch) {
    setEditing(b)
    setForm({
      batch_number:       b.batch_number,
      product_id:         b.product_id,
      quantity:           b.quantity.toString(),
      price_exw_cny:      b.price_exw_cny.toString(),
      cny_rate:           b.cny_rate.toString(),
      cny_rate_date:      b.cny_rate_date?.toString().split('T')[0] || '',
      customs_duty_pct:   b.customs_duty_pct.toString(),
      transport_cost:     b.transport_cost.toString(),
      other_costs:        b.other_costs.toString(),
      markup_coefficient: b.markup_coefficient.toString(),
      gtd_number:         b.gtd_number || '',
      gtd_date:           b.gtd_date?.toString().split('T')[0] || '',
    })
    setProductSearch(b.product_article ? `${b.product_article} — ${b.product_name}` : '')
    setFormError('')
    setPanelOpen(true)
  }

  function closePanel() { setPanelOpen(false) }

  function setField(key: keyof FormState, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function selectProduct(p: Product) {
    setForm(f => ({ ...f, product_id: p.id }))
    setProductSearch(`${p.auteko_article} — ${p.name}`)
    setShowProductList(false)
  }

  async function handleSave() {
    if (!form.batch_number.trim()) { setFormError('Введите номер партии'); return }
    if (!form.product_id)          { setFormError('Выберите товар'); return }
    if (!form.quantity || parseInt(form.quantity) <= 0) { setFormError('Введите количество'); return }
    if (!form.price_exw_cny || parseFloat(form.price_exw_cny) <= 0) { setFormError('Введите цену EXW'); return }
    if (!form.cny_rate || parseFloat(form.cny_rate) <= 0) { setFormError('Введите курс юаня'); return }

    setSaving(true)
    setFormError('')
    try {
      const body = {
        batch_number:       form.batch_number.trim(),
        product_id:         form.product_id,
        quantity:           parseInt(form.quantity),
        price_exw_cny:      parseFloat(form.price_exw_cny),
        cny_rate:           parseFloat(form.cny_rate),
        cny_rate_date:      form.cny_rate_date,
        customs_duty_pct:   parseFloat(form.customs_duty_pct) || 0,
        transport_cost:     parseFloat(form.transport_cost)   || 0,
        other_costs:        parseFloat(form.other_costs)      || 0,
        markup_coefficient: parseFloat(form.markup_coefficient) || 1.25,
        gtd_number:         form.gtd_number.trim() || null,
        gtd_date:           form.gtd_date || null,
      }

      const url    = editing ? `/api/batches/${editing.id}` : '/api/batches'
      const method = editing ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) { setFormError(json.error || 'Ошибка сохранения'); return }

      closePanel()
      load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(b: Batch, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`Удалить партию ${b.batch_number}?`)) return
    const res = await fetch(`/api/batches/${b.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error || 'Ошибка удаления')
      return
    }
    load()
  }

  // ── Статистика ─────────────────────────────────────────────
  const totalUnits = batches.reduce((s, b) => s + b.quantity, 0)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* ── КОНТЕНТ ─────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        marginRight: panelOpen ? '440px' : '0',
        transition: 'margin-right .2s',
      }}>

        {/* Топбар */}
        <div style={{
          height: '52px', flexShrink: 0,
          background: '#fff', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: '16px',
        }}>
          <span style={{ fontSize: '15px', fontWeight: 600 }}>Партии</span>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {[
              { label: 'партий', value: total,      color: 'var(--ink)' },
              { label: 'единиц всего', value: totalUnits, color: 'var(--blue-2)' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', gap: '5px',
                padding: '0 16px',
                borderRight: i === 0 ? '1px solid var(--line)' : 'none',
              }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', fontWeight: 500, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>{s.label}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus /> Новая партия
          </button>
        </div>

        {/* Поиск */}
        <div style={{
          height: '46px', flexShrink: 0,
          background: '#fff', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: '8px',
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex' }}>
              <IconSearch />
            </span>
            <input className="input" style={{ paddingLeft: '30px' }}
              placeholder="Поиск по номеру партии, артикулу, наименованию…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Таблица */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>№ партии</th>
                <th style={{ width: '120px' }}>Арт. AUTEKO</th>
                <th>Наименование</th>
                <th style={{ width: '80px' }}>Кол-во</th>
                <th style={{ width: '110px' }}>
                  <Tooltip text="EXW (Ex Works) — цена товара на складе поставщика в Китае, без учёта доставки и таможни. Указывается в юанях за единицу." label="Цена EXW" />
                </th>
                <th style={{ width: '90px' }}>
                  <Tooltip text="Курс юаня (CNY) к рублю (RUB) на дату закупки. Фиксируется вручную для каждой партии." label="Курс CNY" />
                </th>
                <th style={{ width: '120px' }}>
                  <Tooltip text="Себестоимость — итоговая стоимость единицы товара с учётом закупки, пошлины, доставки и прочих расходов. Считается автоматически." label="С/С руб./ед." />
                </th>
                <th style={{ width: '120px' }}>
                  <Tooltip text="Цена коммерческого предложения — цена по которой товар предлагается клиенту. Равна себестоимости × коэффициент наценки." label="Цена КП" />
                </th>
                <th style={{ width: '110px' }}>
                  <Tooltip text="Прибыль с одной единицы товара: Цена КП минус Себестоимость." label="Прибыль/ед." />
                </th>
                <th style={{ width: '64px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10}><div className="empty-state"><div className="empty-sub">Загрузка…</div></div></td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan={10}>
                  <div className="empty-state">
                    <div className="empty-title">{search ? 'Ничего не найдено' : 'Нет партий'}</div>
                    <div className="empty-sub">{search ? 'Попробуйте другой запрос' : 'Создайте первую партию'}</div>
                  </div>
                </td></tr>
              ) : batches.map(b => (
                <tr key={b.id} onClick={() => openEdit(b)}>
                  <td><span style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '12.5px', color: 'var(--ink)' }}>{b.batch_number}</span></td>
                  <td><span className="cell-article">{b.product_article}</span></td>
                  <td><span className="cell-name">{b.product_name}</span></td>
                  <td><span className="cell-num">{b.quantity}</span></td>
                  <td><span className="cell-mono">{fmtCny(b.price_exw_cny)}</span></td>
                  <td><span className="cell-mono">{Number(b.cny_rate)?.toFixed(2)}</span></td>
                  <td><span className="cell-num">{fmtRub(b.cost_price_rub)}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--blue-2)' }}>{fmtRub(b.price_kp_rub)}</span></td>
                  <td><span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 500, color: 'var(--green)' }}>+{fmtRub(b.profit_per_unit)}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="row-btn" title="Редактировать" onClick={e => { e.stopPropagation(); openEdit(b) }}><IconEdit /></button>
                      <button className="row-btn" title="Удалить" onClick={e => handleDelete(b, e)} style={{ color: 'var(--red)' }}><IconDelete /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── БОКОВАЯ ПАНЕЛЬ ──────────────────────────────────── */}
      {panelOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '440px',
          background: '#fff', borderLeft: '1px solid var(--line)',
          display: 'flex', flexDirection: 'column', zIndex: 50,
          boxShadow: '-4px 0 16px rgba(0,0,0,0.06)',
        }}>
          {/* Шапка */}
          <div style={{
            height: '52px', flexShrink: 0, padding: '0 16px',
            borderBottom: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
              {editing ? `Партия ${editing.batch_number}` : 'Новая партия'}
            </span>
            <button onClick={closePanel} style={{
              width: '28px', height: '28px', border: '1px solid var(--line)',
              borderRadius: '4px', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)',
            }}><IconClose /></button>
          </div>

          {/* Тело */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

            <div className="section-label">Идентификация</div>
            <div className="field-row">
              <div className="field">
                <label>№ партии *</label>
                <input className="input input-mono" value={form.batch_number}
                  onChange={e => setField('batch_number', e.target.value)}
                  placeholder="P-2026-01" disabled={!!editing} />
              </div>
              <div className="field">
                <label>Дата курса *</label>
                <input className="input" type="date" value={form.cny_rate_date}
                  onChange={e => setField('cny_rate_date', e.target.value)} />
              </div>
            </div>

            {/* Выбор товара */}
            <div className="field" style={{ position: 'relative' }}>
              <label>Товар (арт. AUTEKO) *</label>
              <input className="input"
                value={productSearch}
                onChange={e => { setProductSearch(e.target.value); setShowProductList(true) }}
                onFocus={() => setShowProductList(true)}
                placeholder="Начните вводить артикул или название…"
                disabled={!!editing}
              />
              {showProductList && filteredProducts.length > 0 && !editing && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                  background: '#fff', border: '1px solid var(--line)', borderRadius: '4px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: '200px', overflowY: 'auto',
                }}>
                  {filteredProducts.map(p => (
                    <div key={p.id}
                      onClick={() => selectProduct(p)}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--line-2)',
                        fontSize: '12.5px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--blue-bg)')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--blue-2)' }}>{p.auteko_article}</span>
                      <span style={{ color: 'var(--ink-3)', margin: '0 6px' }}>—</span>
                      <span>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section-label">Закупка</div>
            <div className="field-row">
              <div className="field">
                <label>Количество, шт. *</label>
                <input className="input input-mono" type="number" min="1"
                  value={form.quantity} onChange={e => setField('quantity', e.target.value)} placeholder="10" />
              </div>
              <div className="field">
                <label>
                  <Tooltip text="EXW (Ex Works) — цена на складе поставщика в Китае без доставки и таможни. В юанях за единицу товара." label="Цена EXW, ¥/ед. *" />
                </label>
                <input className="input input-mono" type="number" min="0" step="0.01"
                  value={form.price_exw_cny} onChange={e => setField('price_exw_cny', e.target.value)} placeholder="1850" />
              </div>
            </div>
            <div className="field">
              <label>
                <Tooltip text="Курс юаня к рублю на дату закупки. Уточняйте в банке или на сайте ЦБ РФ. Фиксируется отдельно для каждой партии — исторические расчёты не меняются." label="Курс CNY → ₽ *" />
              </label>
              <input className="input input-mono" type="number" min="0" step="0.01"
                value={form.cny_rate} onChange={e => setField('cny_rate', e.target.value)} placeholder="12.85" />
            </div>

            <div className="section-label">Расходы (руб., на всю партию)</div>
            <div className="field-row">
              <div className="field">
                <label>
                  <Tooltip text="Таможенная пошлина в % от стоимости товара в рублях. Ставка зависит от кода ТНВЭД. Например: 8% означает что к цене EXW добавляется 8%." label="Пошлина, %" />
                </label>
                <input className="input input-mono" type="number" min="0" max="100" step="0.1"
                  value={form.customs_duty_pct} onChange={e => setField('customs_duty_pct', e.target.value)} placeholder="8" />
              </div>
              <div className="field">
                <label>
                  <Tooltip text="Общая стоимость доставки всей партии от поставщика до вашего склада (фрахт, экспедиция и т.д.). Делится на количество единиц при расчёте себестоимости." label="Доставка, ₽" />
                </label>
                <input className="input input-mono" type="number" min="0"
                  value={form.transport_cost} onChange={e => setField('transport_cost', e.target.value)} placeholder="18000" />
              </div>
            </div>
            <div className="field">
              <label>
                <Tooltip text="Любые другие расходы на всю партию: брокер, сертификация, хранение, банковские комиссии и т.п. Также делятся на количество единиц." label="Прочие расходы, ₽" />
              </label>
              <input className="input input-mono" type="number" min="0"
                value={form.other_costs} onChange={e => setField('other_costs', e.target.value)} placeholder="0" />
            </div>

            <div className="section-label">Наценка</div>
            <div className="field">
              <label>
                <Tooltip text={'Коэффициент на который умножается себестоимость:\n1.25 → наценка 25%\n1.50 → наценка 50%\n2.00 → наценка 100%\nЦена КП = Себестоимость × Коэффициент'} label="Коэффициент наценки" />
              </label>
              <input className="input input-mono" type="number" min="1" step="0.01"
                value={form.markup_coefficient} onChange={e => setField('markup_coefficient', e.target.value)} placeholder="1.25" />
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '3px' }}>
                1.25 = наценка 25% · 1.5 = наценка 50%
              </div>
            </div>

            {/* ЖИВОЙ РАСЧЁТ */}
            {calc && (
              <>
                <div className="section-label">Расчёт (обновляется автоматически)</div>
                <div className="calc-box">
                  <div className="calc-row">
                    <span className="calc-label">EXW в рублях</span>
                    <span className="calc-val">{fmtRub(calc.exwRub)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">+ Пошлина {form.customs_duty_pct}%</span>
                    <span className="calc-val">{fmtRub(calc.dutyAmt)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">+ Логистика на ед.</span>
                    <span className="calc-val">{fmtRub(calc.perUnit)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">Себестоимость/ед.</span>
                    <span className="calc-val">{fmtRub(calc.costPrice)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">Прибыль с ед.</span>
                    <span className="calc-val" style={{ color: 'var(--green)' }}>+{fmtRub(calc.profit)}</span>
                  </div>
                  <div className="calc-row">
                    <span className="calc-label">Цена КП / ед.</span>
                    <span className="calc-val">{fmtRub(calc.kpPrice)}</span>
                  </div>
                </div>
              </>
            )}

            <div className="section-label">Таможня</div>
            <div className="field">
              <label>
                <Tooltip text="ГТД — Грузовая таможенная декларация. Документ подтверждающий прохождение таможенного оформления. Номер выглядит так: 10210020/051026/0012345. Можно заполнить позже." label="Номер ГТД" />
              </label>
              <input className="input input-mono" value={form.gtd_number}
                onChange={e => setField('gtd_number', e.target.value)}
                placeholder="10210020/051026/0012345" />
            </div>
            <div className="field">
              <label>Дата ГТД</label>
              <input className="input" type="date" value={form.gtd_date}
                onChange={e => setField('gtd_date', e.target.value)} />
            </div>

            {formError && <div className="notice notice-error">{formError}</div>}
          </div>

          {/* Футер */}
          <div style={{
            padding: '12px 16px', borderTop: '1px solid var(--line)',
            display: 'flex', gap: '8px', flexShrink: 0, background: '#fff',
          }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}
              style={{ flex: 1, justifyContent: 'center' }}>
              {saving ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button className="btn btn-outline btn-lg" onClick={closePanel}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  )
}
