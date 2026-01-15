
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
let trendChart = null
let categories = { income: [], expense: [] }
let editingTransactionId = null
let currentModalType = 'expense'

const DEFAULT_CATEGORIES = {
  expense: ['Ăn uống', 'Di chuyển', 'Nhà cửa', 'Vui chơi', 'Sức khoẻ', 'Khác'],
  income: ['Lương', 'Thưởng', 'Đầu tư', 'Khác']
}

/*************** ADD ****************/
async function addTransaction() {
  const amount = Number(document.getElementById('amount').value)
  const type = document.getElementById('type').value
  const category = document.getElementById('category').value
  const description = document.getElementById('description').value
  const dateInput = document.getElementById('date').value

  // Use selected date or fallback to now (though input should be defaulted)
  // Ensure we keep time component if possible? No, input[date] is just YYYY-MM-DD.
  // We can attach current time or 00:00:00. Let's use 12:00 to avoid timezone edge cases jumping days.
  // Actually, simplistic approach: append T00:00:00 or similar.
  // Better: Create date object from input.
  const date = dateInput ? new Date(dateInput).toISOString() : new Date().toISOString()
  if (!amount || amount <= 0) {
    alert('Vui lòng nhập số tiền')
    return
  }

  // UPDATE Mode
  if (editingTransactionId) {
    const { error } = await db
      .from('transactions')
      .update({ amount, type, category, description, date })
      .eq('id', editingTransactionId)

    if (error) {
      alert(error.message)
      return
    }

    editingTransactionId = null
    document.getElementById('save-btn').textContent = 'Thêm giao dịch'
  }
  // INSERT Mode
  else {
    const { error } = await db.from('transactions').insert([
      { amount, type, category, description, date }
    ])

    if (error) {
      alert(error.message)
      return
    }
  }

  // Reset form
  document.getElementById('amount').value = ''
  document.getElementById('category').value = 'Khác' // simplistic reset, better to trigger renderCategories
  document.getElementById('description').value = ''
  document.getElementById('type').value = 'income' // Reset type default
  document.getElementById('date').value = new Date().toISOString().slice(0, 10) // Reset to today

  // Trigger type change to reset categories correctly
  document.getElementById('type').dispatchEvent(new Event('change'))

  await fetchTransactions()
}

function editTransaction(id) {
  const t = allTransactions.find(x => x.id === id)
  if (!t) return

  document.getElementById('amount').value = t.amount
  document.getElementById('type').value = t.type
  // Trigger change so category list updates
  renderCategories(t.type)

  document.getElementById('category').value = t.category || ''
  document.getElementById('description').value = t.description || ''

  // Set date input
  if (t.date) {
    document.getElementById('date').value = t.date.slice(0, 10) // YYYY-MM-DD
  }

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
      if (!t.date) return false // Skip items without date
      const m = t.date.substring(0, 7) // Safe slicing YYYY-MM
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
        <button class="delete-btn" onclick="editTransaction('${t.id}')" style="margin-right: 8px;">✏️</button>
        <button class="delete-btn" onclick="deleteTransaction('${t.id}')">❌</button>
      </div>
    `
    list.appendChild(li)
  })

  document.getElementById('total-income').textContent = income.toLocaleString()
  document.getElementById('total-expense').textContent = expense.toLocaleString()
  document.getElementById('balance').textContent =
    (income - expense).toLocaleString()

  updateDoughnutChart(listData)
  // Trend chart uses ALL data, not just selected month
  updateTrendChart(allTransactions)
}

/*************** MONTH PICKER ****************/
document.getElementById('month-filter').addEventListener('change', e => {
  selectedMonth = e.target.value
  render()
})

/*************** CHART ****************/
/*************** CHART ****************/
document.getElementById('chart-type-selector').addEventListener('change', () => {
  render()
})

function updateDoughnutChart(transactions) {
  const canvas = document.getElementById('expense-chart');
  if (!canvas) return; // Kiểm tra an toàn nếu chưa load giao diện

  const ctx = canvas.getContext('2d');
  const chartType = document.getElementById('chart-type-selector').value; // income | expense

  // 1. Lọc dữ liệu theo loại (Thu hoặc Chi)
  const filtered = transactions.filter(t => t.type === chartType);

  // 2. Nhóm tổng tiền theo danh mục
  const grouped = {};
  filtered.forEach(t => {
    const cat = t.category || 'Khác';
    grouped[cat] = (grouped[cat] || 0) + Number(t.amount);
  });

  // 3. Chuyển đổi sang mảng và SẮP XẾP giảm dần (để danh mục lớn nhất hiện đầu tiên)
  const sortedEntries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const labels = sortedEntries.map(e => e[0]);
  const data = sortedEntries.map(e => e[1]);

  // 4. Xử lý màu sắc thông minh (Tự động lặp lại màu nếu danh mục > 12)
  const baseColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#C9CBCF', '#E7E9ED', '#76D7C4', '#F1948A', '#85C1E9', '#F7DC6F'
  ];
  const backgroundColors = labels.map((_, i) => baseColors[i % baseColors.length]);

  // 5. Hủy biểu đồ cũ trước khi vẽ mới để tránh lỗi chồng đè
  if (myChart) {
    myChart.destroy();
  }

  // 6. Vẽ biểu đồ mới
  myChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: chartType === 'income' ? 'Thu nhập' : 'Chi tiêu',
        data: data,
        backgroundColor: backgroundColors,
        hoverOffset: 4,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Giúp biểu đồ không bị méo trên mobile
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: chartType === 'income' ? 'Phân bố Thu nhập' : 'Phân bố Chi tiêu',
          font: { size: 16 }
        },
        tooltip: {
          callbacks: {
            // Định dạng số tiền sang VNĐ trong tooltip
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed !== null) {
                label += new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(context.parsed);
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function updateTrendChart(transactions) {
  const ctx = document.getElementById('trend-chart').getContext('2d')

  // Group by Month (YYYY-MM)
  // We need all transactions, sorted by date
  const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Extract unique months and aggregate
  const monthlyData = {}

  sorted.forEach(t => {
    // If t.date is missing, skip or use 'Unknown'
    if (!t.date) return

    // date format assumption: YYYY-MM-DD or ISO string
    // Let's safe parse
    const month = t.date.substring(0, 7) // YYYY-MM

    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0 }
    }

    const amt = Number(t.amount)
    if (t.type === 'income') monthlyData[month].income += amt
    else monthlyData[month].expense += amt
  })

  // Get labels (sorted months)
  const labels = Object.keys(monthlyData).sort()
  const incomeData = labels.map(m => monthlyData[m].income)
  const expenseData = labels.map(m => monthlyData[m].expense)
  const balanceData = labels.map(m => monthlyData[m].income - monthlyData[m].expense)

  if (trendChart) {
    trendChart.destroy()
  }

  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Thu',
          data: incomeData,
          backgroundColor: '#16a34a',
          order: 2
        },
        {
          label: 'Chi',
          data: expenseData,
          backgroundColor: '#dc2626',
          order: 3
        },
        {
          label: 'Số dư',
          data: balanceData,
          type: 'line', // Mix chart type
          borderColor: '#2563eb',
          backgroundColor: '#2563eb',
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#2563eb',
          order: 0
        }
      ]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'So sánh Thu - Chi - Số dư theo tháng'
        }
      }
    }
  })
}



/*************** CATEGORIES ****************/
document.getElementById('type').addEventListener('change', (e) => {
  renderCategories(e.target.value)
})

function renderCategories(type) {
  const select = document.getElementById('category')
  const currentType = type || document.getElementById('type').value
  select.innerHTML = ''

  const list = categories[currentType] || []

  list.forEach(c => {
    const option = document.createElement('option')
    option.value = c
    option.text = c
    select.appendChild(option)
  })
}

function promptAddCategory() {
  // Shortcut to add to current visible type
  const type = document.getElementById('type').value
  const name = prompt(`Nhập tên danh mục ${type === 'income' ? 'Thu' : 'Chi'} mới:`)
  if (name) {
    addCategory(name, type)
  }
}

function addCategory(name, type) {
  if (categories[type].includes(name)) {
    alert('Danh mục đã tồn tại')
    return
  }

  categories[type].push(name)
  localStorage.setItem('categories', JSON.stringify(categories))
  renderCategories(type)

  // Select the new category
  document.getElementById('category').value = name
}

function manageCategories() {
  // Sync modal type with current main form type
  currentModalType = document.getElementById('type').value
  // Update radio button
  document.querySelector(`input[name="cat-modal-type"][value="${currentModalType}"]`).checked = true

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

function switchModalType(type) {
  currentModalType = type
  renderCategoryListInModal()
}

function renderCategoryListInModal() {
  const list = document.getElementById('category-list-modal')
  list.innerHTML = ''

  const currentList = categories[currentModalType] || []

  currentList.forEach((cat, index) => {
    const li = document.createElement('li')
    li.className = 'category-item'

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
  if (categories[currentModalType].includes(name)) {
    alert('Danh mục đã tồn tại')
    return
  }

  categories[currentModalType].push(name)
  localStorage.setItem('categories', JSON.stringify(categories))
  input.value = ''
  renderCategoryListInModal()
}

function deleteCategoryInline(name) {
  if (!confirm(`Xoá danh mục "${name}"?`)) return

  categories[currentModalType] = categories[currentModalType].filter(c => c !== name)
  localStorage.setItem('categories', JSON.stringify(categories))
  renderCategoryListInModal()
}

function renameCategoryInline(index) {
  const list = categories[currentModalType]
  const oldName = list[index]
  const newName = prompt('Tên mới:', oldName)

  if (!newName || newName === oldName) return
  if (list.includes(newName)) {
    alert('Tên danh mục đã tồn tại')
    return
  }

  categories[currentModalType][index] = newName
  localStorage.setItem('categories', JSON.stringify(categories))

  // Update transactions locally - a bit trickier since user might have same Cat name in both lists? 
  // Assuming unique enough or just replace matching category string.
  allTransactions.forEach(t => {
    // Only update if existing category matches AND type matches (optional, but safer)
    if (t.category === oldName) t.category = newName
  })

  // Update DB (optimistic)
  updateCategoryInDB(oldName, newName)

  renderCategoryListInModal()
  render()
}

// Close modal when clicking outside
window.onclick = function (event) {
  const modal = document.getElementById('category-modal')
  if (event.target == modal) {
    closeCategoryModal()
  }
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
    const parsed = JSON.parse(savedCats)

    if (Array.isArray(parsed)) {
      // MIGRATION: Convert Array -> Object
      categories = {
        expense: parsed,
        income: ['Lương', 'Thưởng', 'Đầu tư', 'Khác'] // Defaults for income
      }
      localStorage.setItem('categories', JSON.stringify(categories))
    } else {
      categories = parsed
    }
  } else {
    categories = DEFAULT_CATEGORIES
    localStorage.setItem('categories', JSON.stringify(categories))
  }

  // Default render for 'income'
  const defaultType = document.getElementById('type').value || 'income'
  renderCategories(defaultType)

  // Set default date to today
  document.getElementById('date').value = new Date().toISOString().slice(0, 10)

  const now = new Date().toISOString().slice(0, 7)
  document.getElementById('month-filter').value = now
  selectedMonth = now
  fetchTransactions()
})()
