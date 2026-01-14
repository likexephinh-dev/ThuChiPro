
/*************************************************
 * 1. KẾT NỐI SUPABASE (ĐỔI TÊN BIẾN)
 *************************************************/

const SUPABASE_URL = 'https://ddumqdktlcyxwdsvefkl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdW1xZGt0bGN5eHdkc3ZlZmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzY1NDAsImV4cCI6MjA4MzkxMjU0MH0.nUH6iBJIWU9QOYT7SlaiiGB5ugstV-JgOMRC4GEyZYA'

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

/*************************************************
 * 2. THÊM GIAO DỊCH
 *************************************************/

async function addTransaction() {
  const amount = Number(document.getElementById('amount').value)
  const type = document.getElementById('type').value
  const category = document.getElementById('category').value
  const description = document.getElementById('description').value

  if (!amount || amount <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ')
    return
  }

  const { error } = await db
    .from('transactions')
    .insert([{ amount, type, category, description }])

  if (error) {
    alert('❌ Lỗi: ' + error.message)
    console.error(error)
  } else {
    loadTransactions()
  }
}

/*************************************************
 * 3. HIỂN THỊ GIAO DỊCH
 *************************************************/

async function loadTransactions() {
  const { data, error } = await db
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  const list = document.getElementById('transaction-list')
  list.innerHTML = ''

  let totalIncome = 0
  let totalExpense = 0

  data.forEach(item => {
    const amount = Number(item.amount)

    if (item.type === 'income') {
      totalIncome += amount
    } else {
      totalExpense += amount
    }

    const li = document.createElement('li')
    li.innerHTML = `
      <strong>${item.type === 'income' ? '➕ Thu' : '➖ Chi'}</strong>
      - ${amount.toLocaleString()} đ
      <br />
      <small>${item.category || ''} ${item.description || ''}</small>
    `
    list.appendChild(li)
  })

  document.getElementById('total-income').textContent =
    totalIncome.toLocaleString()

  document.getElementById('total-expense').textContent =
    totalExpense.toLocaleString()

  document.getElementById('balance').textContent =
    (totalIncome - totalExpense).toLocaleString()
}

/*************************************************
 * 4. LOAD KHI MỞ TRANG
 *************************************************/

document.addEventListener('DOMContentLoaded', loadTransactions)
