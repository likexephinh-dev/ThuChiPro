
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
let myChart = null
let categories = []
let editingTransactionId = null

const DEFAULT_CATEGORIES = ['Ăn uống', 'Di chuyển', 'Nhà cửa', 'Vui chơi', 'Sức khoẻ', 'Lương', 'Thưởng', 'Khác']

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

  // UPDATE Mode
  if (editingTransactionId) {
    const { error } = await db
      .from('transactions')
      .update({ amount, type, category, description })
      .eq('id', editingTransactionId)

    if (error) {
      alert(error.message)
      return
    }

    editingTransactionId = null
    editingTransactionId = null
    document.getElementById('save-btn').textContent = 'Thêm giao dịch'
  }
  // INSERT Mode
  else {
    const { error } = await db.from('transactions').insert([
      { amount, type, category, description }
    ])

    if (error) {
      alert(error.message)
      return
    }
  }

  // Reset form
  document.getElementById('amount').value = ''
  document.getElementById('category').value = ''
  document.getElementById('description').value = ''
  document.getElementById('type').value = 'income' // Reset type default

  await fetchTransactions()
}

function editTransaction(id) {
  const t = allTransactions.find(x => x.id === id)
  if (!t) return

  document.getElementById('amount').value = t.amount
  document.getElementById('type').value = t.type
  document.getElementById('category').value = t.category || ''
  document.getElementById('description').value = t.description || ''

  editingTransactionId = id
  editingTransactionId = id
  document.getElementById('save-btn').textContent = '💾 Lưu thay đổi'

  // Scroll to functionality
  document.querySelector('.app').scrollIntoView({ behavior: 'smooth' })
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
      <div class="tx-actions">
        <button class="delete-btn" onclick="editTransaction('${t.id}')" style="margin-right: 8px;">✏️</button>
        <button class="delete-btn" onclick="deleteTransaction('${t.id}')">❌</button>
      </div>
      </div>
    `
    list.appendChild(li)
  })

  document.getElementById('total-income').textContent = income.toLocaleString()
  document.getElementById('total-expense').textContent = expense.toLocaleString()
  document.getElementById('balance').textContent =
    (income - expense).toLocaleString()

  updateChart(listData)
}

/*************** MONTH PICKER ****************/
document.getElementById('month-filter').addEventListener('change', e => {
  selectedMonth = e.target.value
  render()
})

/*************** CHART ****************/
function updateChart(transactions) {
  const ctx = document.getElementById('expense-chart').getContext('2d')

  // Filter expenses only
  const expenses = transactions.filter(t => t.type === 'expense')

  // Group by category
  const categories = {}
  expenses.forEach(t => {
    const cat = t.category || 'Khác'
    categories[cat] = (categories[cat] || 0) + Number(t.amount)
  })

  // Prepare data
  const labels = Object.keys(categories)
  const data = Object.values(categories)

  // Destroy old chart if exists
  if (myChart) {
    myChart.destroy()
  }

  // Draw new chart
  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Chi tiêu',
        data: data,
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        },
        title: {
          display: true,
          text: 'Phân bố chi tiêu tháng này'
        }
      }
    }
  })
}



/*************** CATEGORIES ****************/
function renderCategories() {
  const select = document.getElementById('category')
  select.innerHTML = ''

  categories.forEach(c => {
    const option = document.createElement('option')
    option.value = c
    option.text = c
    select.appendChild(option)
  })
}

function promptAddCategory() {
  const name = prompt('Nhập tên danh mục mới:')
  if (name) {
    addCategory(name)
  }
}

function addCategory(name) {
  if (categories.includes(name)) {
    alert('Danh mục đã tồn tại')
    return
  }

  categories.push(name)
  localStorage.setItem('categories', JSON.stringify(categories))
  renderCategories()

  // Select the new category
  document.getElementById('category').value = name
}

function manageCategories() {
  openCategoryModal()
}

// ----- MODAL LOGIC -----
function openCategoryModal() {
  const modal = document.getElementById('category-modal')
  modal.style.display = 'flex'
  renderCategoryListInModal()
}

function closeCategoryModal() {
  document.getElementById('category-modal').style.display = 'none'
  renderCategories() // Refresh main dropdown
}

function renderCategoryListInModal() {
  const list = document.getElementById('category-list-modal')
  list.innerHTML = ''

  categories.forEach((cat, index) => {
    const li = document.createElement('li')
    li.className = 'category-item'

    // Check if being edited
    // Simple approach: list items are static, we edit via a prompt or replace with input? 
    // Let's make it inline editable for better UX

    li.innerHTML = `
      <span id="cat-text-${index}">${cat}</span>
      <div class="cat-actions">
        <button onclick="renameCategoryInline(${index})" style="background: #f59e0b;">Sửa</button>
        <button onclick="deleteCategoryInline('${cat}')" style="background: #ef4444;">Xoá</button>
      </div>
    `
    list.appendChild(li)
  })
}

function addCategoryInModal() {
  const input = document.getElementById('new-cat-input')
  const name = input.value.trim()

  if (!name) return
  if (categories.includes(name)) {
    alert('Danh mục đã tồn tại')
    return
  }

  categories.push(name)
  localStorage.setItem('categories', JSON.stringify(categories))
  input.value = ''
  renderCategoryListInModal()
}

function deleteCategoryInline(name) {
  if (!confirm(`Xoá danh mục "${name}"?`)) return

  categories = categories.filter(c => c !== name)
  localStorage.setItem('categories', JSON.stringify(categories))
  renderCategoryListInModal()
}

function renameCategoryInline(index) {
  const oldName = categories[index]
  const newName = prompt('Tên mới:', oldName)

  if (!newName || newName === oldName) return
  if (categories.includes(newName)) {
    alert('Tên danh mục đã tồn tại')
    return
  }

  categories[index] = newName
  localStorage.setItem('categories', JSON.stringify(categories))

  // Update transactions locally
  allTransactions.forEach(t => {
    if (t.category === oldName) t.category = newName
  })

  // Update DB (optimistic)
  updateCategoryInDB(oldName, newName)

  renderCategoryListInModal()
  render() // Refresh main list to show new names
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('category-modal')
  if (event.target == modal) {
    closeCategoryModal()
  }
}

function renameCategory() {
  const oldName = prompt('Nhập tên danh mục cần sửa (chính xác):')
  if (!categories.includes(oldName)) {
    alert('Không tìm thấy danh mục này.')
    return
  }

  const newName = prompt('Nhập tên mới:', oldName)
  if (!newName || newName === oldName) return

  if (categories.includes(newName)) {
    alert('Tên danh mục mới đã tồn tại.')
    return
  }

  // Update categories array
  const index = categories.indexOf(oldName)
  categories[index] = newName
  localStorage.setItem('categories', JSON.stringify(categories))

  // Update all transactions with this category locally
  allTransactions.forEach(t => {
    if (t.category === oldName) t.category = newName
  })

  // Update UI
  renderCategories()
  document.getElementById('category').value = newName
  render() // Re-render list & chart

  // Update DB (Advanced/Bonus - doing basic update for now to keep sync)
  updateCategoryInDB(oldName, newName)
}

function deleteCategory() {
  const name = prompt('Nhập tên danh mục cần xoá (chính xác):')
  if (!categories.includes(name)) {
    alert('Không tìm thấy danh mục này.')
    return
  }

  if (!confirm(`Bạn có chắc muốn xoá danh mục "${name}"? Các giao dịch thuộc danh mục này sẽ hiển thị là trống hoặc bạn cần cập nhật lại.`)) return

  categories = categories.filter(c => c !== name)
  localStorage.setItem('categories', JSON.stringify(categories))
  renderCategories()
}

async function updateCategoryInDB(oldName, newName) {
  // Update in Supabase
  // Note: This matches ALL transactions with this category for this user (since RLS handles user isolation usually, or if anon, global)
  // Since we are using anon key and no auth logic visible yet, we assume global or simple.

  const { error } = await db
    .from('transactions')
    .update({ category: newName })
    .eq('category', oldName)

  if (error) console.error('Error updating category in DB:', error)
}

/*************** INIT ****************/
(function init() {
  // Load categories
  const savedCats = localStorage.getItem('categories')
  if (savedCats) {
    categories = JSON.parse(savedCats)
  } else {
    categories = DEFAULT_CATEGORIES
    localStorage.setItem('categories', JSON.stringify(categories))
  }
  renderCategories()

  const now = new Date().toISOString().slice(0, 7)
  document.getElementById('month-filter').value = now
  selectedMonth = now
  fetchTransactions()
})()
