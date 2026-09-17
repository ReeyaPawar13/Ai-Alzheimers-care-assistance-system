import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dayName = dateTime.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = dateTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <header className="bg-white shadow px-6 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-800">Good Morning, Dr. {user.name}</h1>
        <button onClick={logout} className="text-red-600 font-semibold hover:underline">Logout</button>
      </header>

      <section className="px-6 py-4">
        <p className="text-gray-600 font-medium">{dayName}, {dateStr}</p>
        <p className="text-gray-800 font-semibold text-lg">{timeStr}</p>
      </section>

      <main className="flex-grow p-6 space-y-6 overflow-auto">
        {/* Placeholder for dashboard cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Appointments Today</h3>
            <p>Feature coming soon...</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Assigned Patients</h3>
            <p>Feature coming soon...</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Pending Reports</h3>
            <p>Feature coming soon...</p>
          </div>
        </div>
      </main>

      {/* Doctor navigation bottom or sidebar can be added */}
    </div>
  );
};

export default DoctorDashboard;
