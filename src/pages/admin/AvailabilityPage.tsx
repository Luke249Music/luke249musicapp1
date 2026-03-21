import { useState } from 'react';
import { useScheduling } from '../../context/SchedulingContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, addDays, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarOff } from 'lucide-react';

export const AvailabilityPage = () => {
  const { blockedDates, toggleBlockedDate, toggleDayOfWeek } = useScheduling();
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";
    const today = startOfDay(new Date());

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const dateString = format(day, 'yyyy-MM-dd');
        const isBlocked = blockedDates.includes(dateString);
        const isPastDate = isBefore(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div className="p-1" key={day.toString()}>
            <button
              disabled={isPastDate || !isCurrentMonth}
              onClick={() => toggleBlockedDate(dateString)}
              className={`w-full aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all
                ${!isCurrentMonth ? "opacity-20 cursor-default" : isPastDate ? "cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-800/50" : "hover:scale-105 cursor-pointer"}
                ${isBlocked 
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800" 
                  : !isPastDate && isCurrentMonth ? "bg-white dark:bg-[#1a1d2d] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-pink-300 dark:hover:border-pink-700" : ""
                }
              `}
            >
              <span>{formattedDate}</span>
              {isBlocked && <span className="text-[10px] mt-1 font-bold">BLOCKED</span>}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-2" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-gray-500">Click on dates to block them out from your scheduling calendar</p>
      </div>

      <div className="mb-8 glass-panel p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4">Block Entire Days for {currentDate.getFullYear()}</h3>
        <p className="text-gray-500 text-sm mb-4">Click a day to block or unblock every instance of it for the currently viewed calendar year.</p>
        <div className="flex flex-wrap gap-3">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((dayFull, index) => (
            <button
              key={dayFull}
              onClick={() => toggleDayOfWeek(index, currentDate.getFullYear())}
              className="px-4 py-2 bg-white dark:bg-[#1a1d2d] border border-gray-200 dark:border-gray-800 hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-600 rounded-xl transition-all cursor-pointer shadow-sm text-sm font-medium"
            >
              Block {dayFull}s
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-8 rounded-3xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 bg-white dark:bg-[#1a1d2d] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer shadow-sm">
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <h2 className="text-2xl font-bold w-48 text-center text-hot-pink-gradient">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="p-2 bg-white dark:bg-[#1a1d2d] border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer shadow-sm">
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium">
            <CalendarOff className="w-4 h-4" />
            {blockedDates.length} Dates Blocked
          </div>
        </div>

        <div className="grid grid-cols-7 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day} 
              className="text-center font-bold text-gray-400 dark:text-gray-500 pb-2 border-b border-gray-100 dark:border-gray-800"
            >
              {day}
            </div>
          ))}
        </div>

        {renderCells()}
      </div>
    </div>
  );
};
