
import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (startDate: string, endDate: string) => void;
}

export default function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps): React.ReactElement {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(startDate, e.target.value);
  };

  return (
    <div className="bg-secondary p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between">
      <h3 className="text-lg font-semibold whitespace-nowrap text-text-primary">Chọn Khoảng Thời Gian</h3>
      <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary mb-1">Từ ngày</label>
          <input 
            type="date" 
            id="startDate" 
            value={startDate} 
            onChange={handleStartDateChange} 
            className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent appearance-none" 
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary mb-1">Đến ngày</label>
          <input 
            type="date" 
            id="endDate" 
            value={endDate} 
            onChange={handleEndDateChange} 
            className="w-full bg-primary border border-gray-600 rounded-md p-2 focus:ring-accent focus:border-accent appearance-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>
    </div>
  );
}
