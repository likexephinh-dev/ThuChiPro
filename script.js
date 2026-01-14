
/*************************************************
 * 1. KẾT NỐI SUPABASE
 *************************************************/

const SUPABASE_URL = 'https://ddumqdktlcyxwdsvefkl.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_JOHngrHodZvJJ9IYg7mIEA_a-QTXN_G'

const supabase = window.supabase.createClient(
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

  const { error } = await supabase
    .from('transactions')
    .insert([
      {
        amount,
        type,
        category,
        description
      }
    ])

  if (error) {
    alert('❌ Lỗi khi thêm dữ liệu')
    console.error(error)
  } else {
    document.getElementById('amount').value = ''
    document.getElementById('category').value = ''
    document.getElementById('description').value = ''
    loadTransactions()
  }
}

/*************************************************
 * 3. HIỂN THỊ GIAO DỊCH
 *************************************************/

async function loadTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  const list = document.getElementById('transaction-list')
  list.innerHTML = ''

  data.forEach(item => {
    const li = document.createElement('li')
    li.innerHTML = `
      <strong>${item.type === 'income' ? '➕ Thu' : '➖ Chi'}</strong>
      | ${item.amount.toLocaleString()} đ
      <br/>
      ${item.category || 'Không danh mục'}
      ${item.description ? ` - ${item.description}` : ''}
    `
    list.appendChild(li)
  })
}

/*************************************************
 * 4. LOAD DỮ LIỆU KHI MỞ TRANG
 *************************************************/

document.addEventListener('DOMContentLoaded', loadTransactions)
