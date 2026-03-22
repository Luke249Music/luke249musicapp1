import { useState } from 'react';
import { useScheduling } from '../../context/SchedulingContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, addDays, isBefore, startOfDay, parse } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { db } from '../../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

const commonHours = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

export const AvailabilityPage = () => {
  const { slots } = useScheduling();
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getSlotsForDate = (dateString: string) => {
    return slots.filter(s => s.date === dateString);
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

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const dateString = format(day, 'yyyy-MM-dd');
        const isPastDate = isBefore(day, today);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        const daySlots = getSlotsForDate(dateString);
        const activeCount = daySlots.length;

        const cloneDay = day; // capture for onClick closures
        
        days.push(
          <div className="p-1" key={day.toString()}>
            <button
              disabled={isPastDate || !isCurrentMonth}
              onClick={() => {
                setSelectedDate(cloneDay);
              }}
              className={`relative w-full aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all
                ${!isCurrentMonth ? "opacity-20 cursor-default" : isPastDate ? "cursor-not-allowed opacity-50 bg-gray-50 dark:bg-gray-800/50" : "hover:scale-105 cursor-pointer bg-white dark:bg-[#1a1d2d] border border-gray-100 dark:border-gray-800 shadow-sm hover:border-pink-300 dark:hover:border-pink-700"}
                ${activeCount > 0 ? 'bg-pink-50 dark:bg-pink-900/10' : ''}
              `}
            >
              <span>{formattedDate}</span>
              {!isPastDate && isCurrentMonth && (
                <span className={`text-[10px] mt-1 font-bold ${activeCount > 0 ? 'text-pink-600' : 'text-gray-400'}`}>
                  {activeCount} Slots
                </span>
              )}
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

  const toggleSlot = async (time: string, isActive: boolean, slotId: string, isBooked: boolean) => {
    if (!selectedDate) return;
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const newSlotId = `${dateString}_${time.replace(' ', '')}`;

    if (isActive) {
      if (isBooked) return; // Cannot delete booked slot easily
      // delete
      try {
        await deleteDoc(doc(db, 'schedule', slotId || newSlotId));
      } catch (e) {
        console.error("error deleting slot", e);
      }
    } else {
      // create
      // Rough parse of start and end time in local browser time for now
      const parsedTime = parse(`${dateString} ${time}`, 'yyyy-MM-dd hh:mm a', new Date());
      const endTime = addMonths(parsedTime, 0); // just hacky add 1 hour
      endTime.setHours(endTime.getHours() + 1);

      try {
        await setDoc(doc(db, 'schedule', newSlotId), {
          date: dateString,
          startTime: parsedTime.toISOString(),
          endTime: endTime.toISOString(),
          booked: false,
          bookedBy: null
        });
      } catch (e) {
         console.error("error creating slot", e);
      }
    }
  };


  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 animate-in fade-in">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Availability Schedule</h1>
          <p className="text-gray-500">Click a day to generate and manage specific available booking slots.</p>
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

      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#1a1d2d] animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Slots for {format(selectedDate, 'MMM do, yyyy')}</h2>
                <button onClick={() => setSelectedDate(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
             </div>
             
             <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {commonHours.map(time => {
                  const dateString = format(selectedDate, 'yyyy-MM-dd');
                  const targetId = `${dateString}_${time.replace(' ', '')}`;
                  const existingSlot = slots.find(s => s.id === targetId);
                  const isActive = !!existingSlot;
                  const isBooked = existingSlot?.booked || false;

                  return (
                    <div key={time} className={`flex justify-between items-center p-4 rounded-xl border ${isActive ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/10' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0f111a]'} transition-all`}>
                       <div>
                         <span className="font-bold text-lg">{time}</span>
                         {isActive && <p className={`text-xs font-medium mt-1 uppercase ${isBooked ? 'text-blue-500' : 'text-pink-500'}`}>{isBooked ? 'Booked' : 'Available'}</p>}
                       </div>
                       
                       <button 
                         disabled={isBooked}
                         onClick={() => toggleSlot(time, isActive, targetId, isBooked)}
                         className={`px-4 py-2 rounded-lg font-bold text-sm cursor-pointer transition-colors ${
                           isBooked ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500' :
                           isActive ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                         }`}
                       >
                         {isBooked ? 'LOCKED' : isActive ? 'Remove' : 'Add Slot'}
                       </button>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
