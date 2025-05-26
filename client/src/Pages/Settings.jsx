import React, { useState } from 'react';

function Settings() {
  const [notifications, setNotifications] = useState(true);

  const toggleNotifications = () => {
    setNotifications(!notifications);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <div className="flex items-center">
          <label htmlFor="notifications" className="mr-4">Enable Notifications</label>
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={toggleNotifications}
            className="w-6 h-6"
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
