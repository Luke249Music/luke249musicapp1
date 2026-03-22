import { useTimezone } from '../context/TimezoneContext';

const commonTimezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Australia/Sydney',
];

export const TimezoneSelector = () => {
  const { timezone, setTimezone } = useTimezone();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-6 bg-white dark:bg-[#1a1d2d] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm w-full max-w-xl mx-auto">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Displayed Time Zone:</label>
      <select 
        value={timezone} 
        onChange={(e) => setTimezone(e.target.value)}
        className="bg-transparent border border-gray-200 dark:border-gray-700 p-2 rounded-lg outline-none font-medium text-pink-600 dark:text-pink-400 cursor-pointer w-full text-sm"
      >
        <option value={Intl.DateTimeFormat().resolvedOptions().timeZone}>Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})</option>
        {commonTimezones.map(tz => (
          <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>
        ))}
      </select>
    </div>
  );
};
