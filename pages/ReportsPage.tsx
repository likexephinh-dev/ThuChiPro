
import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DateRangePicker from '../components/DateRangePicker';
import { ExportIcon } from '../components/icons';

interface ReportsPageProps {
  allTransactions: Transaction[];
  incomeCategories: Category[];
  expenseCategories: Category[];
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const yAxisFormatter = (tick: number) => {
    if (tick >= 1000000000) return `${(tick / 1000000000).toFixed(1)} Tỷ`;
    if (tick >= 1000000) return `${(tick / 1000000).toFixed(1)} Tr`;
    if (tick >= 1000) return `${(tick / 1000).toFixed(0)} K`;
    return tick.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-primary p-3 border border-gray-600 rounded shadow-lg">
          <p className="label text-text-secondary font-semibold">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.color }}>
              {`${pld.name}: ${formatCurrency(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

export default function ReportsPage({ allTransactions, expenseCategories }: ReportsPageProps): React.ReactElement {
  const getYearRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    };
  };

  const [dateRange, setDateRange] = useState(getYearRange());
  const [reportType, setReportType] = useState<'monthly' | 'category'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>(expenseCategories[0]?.id || 'all');

  const handleDateChange = (startDate: string, endDate: string) => {
    if (startDate && endDate && startDate > endDate) {
      setDateRange({ startDate: endDate, endDate: startDate });
    } else {
      setDateRange({ startDate, endDate });
    }
  };
  
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      return t.date >= dateRange.startDate && t.date <= dateRange.endDate;
    });
  }, [allTransactions, dateRange]);

  const monthlyReportData = useMemo(() => {
    if (reportType !== 'monthly') return [];
    const monthlyData: Record<string, { income: number, expense: number, net: number }> = {};
    
    filteredTransactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0, net: 0 };
      }
      if (t.type === 'income') {
        monthlyData[month].income += t.amount;
      } else {
        monthlyData[month].expense += t.amount;
      }
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      name: month,
      'Tổng Thu': data.income,
      'Tổng Chi': data.expense,
      'Lợi Nhuận': data.income - data.expense,
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [filteredTransactions, reportType]);
  
  const categoryReportData = useMemo(() => {
    if (reportType !== 'category' || selectedCategory === 'all') return [];

    const dataByDate: Record<string, number> = {};
    const categoryTransactions = filteredTransactions.filter(t => t.category.id === selectedCategory);
    
    categoryTransactions.forEach(t => {
      const date = t.date;
      if (!dataByDate[date]) dataByDate[date] = 0;
      dataByDate[date] += t.amount;
    });

    return Object.entries(dataByDate).map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      'Số Tiền': amount,
      fullDate: date,
    })).sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [filteredTransactions, reportType, selectedCategory]);

  const categoryTransactionsList = useMemo(() => {
    if (reportType !== 'category' || selectedCategory === 'all') return [];
    return filteredTransactions.filter(t => t.category.id === selectedCategory);
  }, [filteredTransactions, reportType, selectedCategory]);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    let dataToExport;
    let headers: string[];

    if(reportType === 'monthly') {
        headers = ["Tháng", "Tổng Thu", "Tổng Chi", "Lợi Nhuận"];
        dataToExport = monthlyReportData.map(item => ({
            Tháng: item.name,
            "Tổng Thu": item["Tổng Thu"],
            "Tổng Chi": item["Tổng Chi"],
            "Lợi Nhuận": item["Lợi Nhuận"]
        }));
    } else {
        headers = ["Ngày", "Mô Tả", "Số Tiền", "Loại", "Danh Mục"];
        dataToExport = categoryTransactionsList.map(t => ({
            Ngày: t.date,
            "Mô Tả": `"${t.description.replace(/"/g, '""')}"`,
            "Số Tiền": t.amount,
            Loại: t.type,
            "Danh Mục": t.category.name,
        }));
    }
    
    if(!dataToExport || dataToExport.length === 0) {
        alert("Không có dữ liệu để xuất.");
        return;
    }

    csvContent += headers.join(",") + "\r\n";
    dataToExport.forEach(row => {
        let rowArray = headers.map(header => row[header as keyof typeof row]);
        csvContent += rowArray.join(",") + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const reportName = reportType === 'monthly' ? 'bao-cao-thang' : `bao-cao-danh-muc-${expenseCategories.find(c=> c.id === selectedCategory)?.name || ''}`;
    link.setAttribute("download", `${reportName}_${dateRange.startDate}_den_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const renderReport = () => {
    if (reportType === 'monthly') {
      return (
        <>
            <h3 className="text-xl font-bold mb-4">Báo cáo Tổng hợp Tháng</h3>
            {monthlyReportData.length > 0 ? (
            <>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyReportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" tickFormatter={yAxisFormatter} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Tổng Thu" fill="#22C55E" />
                <Bar dataKey="Tổng Chi" fill="#EF4444" />
                <Bar dataKey="Lợi Nhuận" fill="#3B82F6" />
                </BarChart>
            </ResponsiveContainer>
            <TransactionTable data={monthlyReportData} headers={['Tháng', 'Tổng Thu', 'Tổng Chi', 'Lợi Nhuận']} keys={['name', 'Tổng Thu', 'Tổng Chi', 'Lợi Nhuận']} />
            </>
             ) : (<p className="text-center text-text-secondary py-8">Không có dữ liệu cho khoảng thời gian đã chọn.</p>)}
        </>
      );
    }
    if (reportType === 'category') {
        const categoryName = expenseCategories.find(c => c.id === selectedCategory)?.name;
        return (
        <>
            <h3 className="text-xl font-bold mb-4">Phân tích Chi tiêu: {categoryName}</h3>
            {categoryReportData.length > 0 ? (
            <>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={categoryReportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
                <XAxis dataKey="date" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" tickFormatter={yAxisFormatter}/>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="Số Tiền" stroke="#F59E0B" strokeWidth={2} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
             <TransactionTable data={categoryTransactionsList} headers={['Ngày', 'Mô tả', 'Số Tiền']} keys={['date', 'description', 'amount']} />
            </>
            ) : (<p className="text-center text-text-secondary py-8">Không có giao dịch cho danh mục này trong khoảng thời gian đã chọn.</p>)}
        </>
        );
    }
    return null;
  };
  
 const TransactionTable = ({ data, headers, keys }: { data: any[], headers: string[], keys: string[] }) => (
    <div className="mt-6 max-h-96 overflow-y-auto">
        <table className="w-full text-left table-auto">
            <thead>
            <tr className="bg-primary sticky top-0">
                {headers.map(h => <th key={h} className="p-3 font-semibold text-text-secondary">{h}</th>)}
            </tr>
            </thead>
            <tbody>
            {data.map((row, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-primary">
                {keys.map(key => (
                    <td key={key} className="p-3">
                    {typeof row[key] === 'number' ? formatCurrency(row[key]) : row[key]}
                    </td>
                ))}
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);


  return (
    <div className="flex flex-col gap-6">
      <DateRangePicker startDate={dateRange.startDate} endDate={dateRange.endDate} onDateChange={handleDateChange} />
      
      <div className="bg-secondary p-4 rounded-lg shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <label htmlFor="reportType" className="font-semibold">Loại Báo Cáo:</label>
            <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as 'monthly' | 'category')}
                className="bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent"
            >
                <option value="monthly">Tổng hợp Tháng</option>
                <option value="category">Phân tích Danh mục</option>
            </select>
        </div>
        {reportType === 'category' && (
             <div className="flex items-center gap-4">
                <label htmlFor="categorySelect" className="font-semibold">Danh Mục Chi:</label>
                <select
                    id="categorySelect"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent min-w-[200px]"
                >
                    {expenseCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>
        )}
        <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent hover:bg-highlight rounded-md transition-colors"
        >
            <ExportIcon />
            Xuất CSV
        </button>
      </div>

      <div className="bg-secondary p-6 rounded-lg shadow-lg">
        {renderReport()}
      </div>
    </div>
  );
}
