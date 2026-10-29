import { useState, useEffect } from 'react';

const MaintenancePopup = ({ lang }) => {
  const [isVisible, setIsVisible] = useState(false);

  const translations = {
    en: {
      title: '🔧 System Maintenance Required',
      message: 'It\'s time for regular system maintenance. Please ensure all sensors are functioning properly and update software if available.',
      reminder: 'This reminder appears every 10 months',
      close: 'Acknowledge',
      learnMore: 'Learn More',
    },
    hi: {
      title: '🔧 सिस्टम रखरखाव आवश्यक',
      message: 'नियमित सिस्टम रखरखाव का समय आ गया है। कृपया सभी सेंसर सही तरीके से काम कर रहे हैं और सॉफ्टवेयर अपडेट उपलब्ध हो तो करें।',
      reminder: 'यह अनुस्मारक हर 10 महीने में दिखाई देता है',
      close: 'स्वीकार करें',
      learnMore: 'और जानें',
    },
    kn: {
      title: '🔧 ವ್ಯವಸ್ಥೆ ನಿರ್ವಹಣೆ ಅಗತ್ಯ',
      message: 'ನಿಯಮಿತ ವ್ಯವಸ್ಥೆ ನಿರ್ವಹಣೆಗೆ ಸಮಯ ಪ್ರಾಪ್ತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಸಂವೇದಕಗಳು ಸರಿಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ ಎಂದು ಖಚಿತಪಡಿಸಿ ಮತ್ತು ಸಂಸ್ಕರಣೆ ಲಭ್ಯವಿದ್ದರೆ ಅನ್ವಯ ಮಾಡಿ.',
      reminder: 'ಈ ಸ್ಮರಣೆಯು ಪ್ರತಿ 10 ತಿಂಗಳಕ್ಕೆ ಕಾಣಿಸಬಹುದು',
      close: 'ಸ್ವೀಕರಿಸಿ',
      learnMore: 'ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ',
    },
  };

  const t = translations[lang] || translations.en;
  const MAINTENANCE_INTERVAL = 10 * 30 * 24 * 60 * 60 * 1000; // 10 months in milliseconds (approximate)

  useEffect(() => {
    const checkMaintenanceReminder = () => {
      const lastMaintenanceReminder = localStorage.getItem('lastMaintenanceReminder');
      const now = Date.now();

      if (!lastMaintenanceReminder) {
        // First time - show popup and set timestamp
        setIsVisible(true);
        localStorage.setItem('lastMaintenanceReminder', now.toString());
      } else {
        const lastReminderTime = parseInt(lastMaintenanceReminder);
        const timeSinceReminder = now - lastReminderTime;

        if (timeSinceReminder >= MAINTENANCE_INTERVAL) {
          // 10 months have passed - show popup again
          setIsVisible(true);
          localStorage.setItem('lastMaintenanceReminder', now.toString());
        }
      }
    };

    checkMaintenanceReminder();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">{t.title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {t.message}
        </p>

        {/* Info Badge */}
        <div className="bg-blue-100 dark:bg-blue-900 border-l-4 border-blue-500 p-3 mb-6 rounded">
          <p className="text-sm text-blue-800 dark:text-blue-200">{t.reminder}</p>
        </div>

        {/* Maintenance Checklist */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Maintenance Checklist:</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Check sensor connections
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Verify calibration readings
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Update software if available
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              Review system logs
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {t.close}
          </button>
          <button
            onClick={() => {
              window.open('https://agrisense.local/maintenance', '_blank');
              handleClose();
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {t.learnMore}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePopup;
