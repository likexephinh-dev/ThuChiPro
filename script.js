
/*************** SUPABASE ****************/
const SUPABASE_URL = 'https://ddumqdktlcyxwdsvefkl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdW1xZGt0bGN5eHdkc3ZlZmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzY1NDAsImV4cCI6MjA4MzkxMjU0MH0.nUH6iBJIWU9QOYT7SlaiiGB5ugstV-JgOMRC4GEyZYA'

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

/*************** STATE ****************/
let allTransactions = []
let selectedMonth = null

/*************** ADD ****************/
async function addTransaction() {
  const amount = Number(document.getElementById('amount').value)
  const type = document.getElementById('type').value
  const category = document.getElementById('category').value
  const description = document.getElementById('description').value

  if (!amount || amount <= 0) {
    alert('Vui lòng nhập số tiền')
    return
  }

  const { error } = await db.from('transactions').insert([
    { amount, type, category, description }
  ])

  if (error) {
    alert(error.message)
    return
  }

  document.getElementById('amount').value = ''
  document.getElementById('category').value = ''
  document.getElementById('description').value = ''

  await fetchTransactions()
}

/*************** DELETE ****************/
async function deleteTransaction(id) {
  if (!confirm('Xoá giao dịch này?')) return

  const { error } = await db
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    alert(error.message)
    return
  }

  await fetchTransactions()
}

/*************** FETCH ****************/
async function fetchTransactions() {
  const { data, error } = await db
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  allTransactions = data
  render()
}

/*************** FILTER + RENDER ****************/
function render() {
  let listData = allTransactions

  if (selectedMonth) {
    listData = allTransactions.filter(t => {
      const m = new Date(t.date).toISOString().slice(0, 7)
      return m === selectedMonth
    })
  }

  const list = document.getElementById('transaction-list')
  list.innerHTML = ''

  let income = 0
  let expense = 0

  listData.forEach(t => {
    const amount = Number(t.amount)
    t.type === 'income' ? (income += amount) : (expense += amount)

    const li = document.createElement('li')
    li.className = `transaction ${t.type}`

    li.innerHTML = `
      <div class="tx-left">
        <div class="tx-type">${t.type === 'income' ? '➕ Thu' : '➖ Chi'}</div>
        <div class="tx-meta">${t.category || ''} ${t.description || ''}</div>
      </div>
      <div class="tx-amount">${amount.toLocaleString()} đ</div>
      <div class="tx-actions">
        <button class="delete-btn" onclick="deleteTransaction(${t.id})">❌</button>
      </div>
    `
    list.appendChild(li)
  })

  document.getElementById('total-income').textContent = income.toLocaleString()
  document.getElementById('total-expense').textContent = expense.toLocaleString()
  document.getElementById('balance').textContent =
    (income - expense).toLocaleString()
}

/*************** MONTH PICKER ****************/
document.getElementById('month-filter').addEventListener('change', e => {
  selectedMonth = e.target.value
  render()
})

/*************** INIT ****************/
(function init() {
  const now = new Date().toISOString().slice(0, 7)
  document.getElementById('month-filter').value = now
  selectedMonth = now
  fetchTransactions()
})()
