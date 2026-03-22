import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useScheduling } from '../context/SchedulingContext';

interface CalendarPickerProps {
  onSelect: (date: string, time: string) => void;
  minDate?: Date;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({ onSelect, minDate }) => {
  const { slots } = useScheduling();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-bold text-hot-pink-gradient">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    );
  };

  const renderDaysTemplate = () => {
    const days = [];
    const dateFormat = "EEE";
    let startDate = startOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="text-center font-medium text-sm text-gray-500 dark:text-gray-400 py-2" key={i}>
          {format(addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

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
    const effectiveMinDate = minDate ? startOfDay(minDate) : today;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        const dateString = format(day, 'yyyy-MM-dd');
        
        // Check if there are any available slots for this day
        const daySlots = slots.filter(s => s.date === dateString && !s.booked);
        const hasAvailability = daySlots.length > 0;
        
        const isDisabled = isBefore(day, effectiveMinDate) || !hasAvailability;
        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
        
        days.push(
          <div
            className={`p-1 ${!isSameMonth(day, monthStart) ? "text-gray-300 dark:text-gray-600" : ""}`}
            key={day.toString()}
          >
            <button
              disabled={isDisabled}
              onClick={() => setSelectedDate(cloneDay)}
              className={`w-full aspect-square flex items-center justify-center rounded-2xl text-sm font-medium transition-all
                ${isDisabled ? "cursor-not-allowed opacity-50" : "hover:bg-pink-100 dark:hover:bg-pink-900/30"}
                ${isSelected ? "bg-hot-pink-gradient text-white shadow-md hover:brightness-110" : "text-gray-700 dark:text-gray-200"}
              `}
            >
              {formattedDate}
            </button>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7 gap-1" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const renderTimeSlots = () => {
    if (!selectedDate) return null;
    return (
      <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-pink-500" />
          Available exactly on {format(selectedDate, 'MMM do')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {slots
            .filter(s => s.date === format(selectedDate, 'yyyy-MM-dd') && !s.booked)
            .map((slot) => {
              const time = format(new Date(slot.startTime), 'hh:mm a');
              return (
                <button
                  key={slot.id}
                  onClick={() => onSelect(slot.id, time)}
                  className="py-3 px-4 rounded-xl border border-pink-200 dark:border-pink-800 text-pink-600 dark:text-pink-400 font-medium text-sm hover:bg-hot-pink-gradient hover:text-white hover:border-transparent transition-all hover:shadow-md"
                >
                  {time}
                </button>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-xl mx-auto w-full">
      {renderHeader()}
      {renderDaysTemplate()}
      {renderCells()}
      {renderTimeSlots()}
    </div>
  );
};
