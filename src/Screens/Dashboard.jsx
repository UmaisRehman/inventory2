import React, { useState } from 'react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sample data
  const dashboardData = {
    checkIn: 42,
    checkOut: 38,
    totalGuests: 156,
    availableRooms: 64,
    occupiedRooms: 92
  };

  const roomTypes = [
    { name: "Single sharing", size: "2.5Gb", available: "2,30", price: "$568/day" },
    { name: "Double sharing", size: "2.5Gb", available: "2,35", price: "$1,068/day" },
    { name: "Triple sharing", size: "", available: "2,25", price: "$1,568/day" },
    { name: "VIP Suit", size: "", available: "4/10", price: "$2,568/day" }
  ];

  const roomStatus = {
    occupied: { clean: 104, dirty: 90, inspected: 4, total: 60 },
    available: { clean: 20, dirty: 30, inspected: 19, total: 30 }
  };

  const feedbacks = [
    { customer: "Mark", room: "A201", comment: "Food could be better." },
    { customer: "Christian", room: "A201", comment: "Facilities are not enough for amount paid." }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-800 text-white w-64 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'ml-0' : '-ml-64'}`}>
        <div className="p-4">
          <h1 className="text-2xl font-bold">Novotel</h1>
        </div>
        <nav className="mt-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left py-3 px-6 flex items-center ${activeTab === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`w-full text-left py-3 px-6 flex items-center ${activeTab === 'rooms' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <span>Rooms</span>
          </button>
          <button 
            onClick={() => setActiveTab('guests')}
            className={`w-full text-left py-3 px-6 flex items-center ${activeTab === 'guests' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <span>Guests</span>
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left py-3 px-6 flex items-center ${activeTab === 'reports' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <span>Reports</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left py-3 px-6 flex items-center ${activeTab === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between p-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-500 focus:outline-none lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Admin</span>
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Today's Check-in</h3>
                  <p className="text-3xl font-bold text-indigo-600">{dashboardData.checkIn}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Today's Check-out</h3>
                  <p className="text-3xl font-bold text-indigo-600">{dashboardData.checkOut}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Total in Hotel</h3>
                  <p className="text-3xl font-bold text-indigo-600">{dashboardData.totalGuests}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-700">Available Rooms</h3>
                  <p className="text-3xl font-bold text-indigo-600">{dashboardData.availableRooms}</p>
                </div>
              </div>

              {/* Room Types */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Rooms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roomTypes.map((room, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      {room.size && <p className="text-sm text-gray-500">{room.size}</p>}
                      <h4 className="font-semibold text-gray-800">{room.name}</h4>
                      <p className="text-gray-600">{room.available}</p>
                      <p className="text-indigo-600 font-medium">{room.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Room Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Occupied Rooms</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Clean</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.occupied.clean}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dirty</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.occupied.dirty}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Inspected</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.occupied.inspected}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.occupied.total}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Rooms</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Clean</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.available.clean}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dirty</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.available.dirty}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Inspected</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.available.inspected}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total</p>
                      <p className="text-2xl font-bold text-indigo-600">{roomStatus.available.total}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Feedback */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Customer Feedback</h3>
                <div className="space-y-4">
                  {feedbacks.map((feedback, index) => (
                    <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <div className="flex justify-between">
                        <span className="font-semibold">{feedback.customer}</span>
                        <span className="text-gray-500">{feedback.room}</span>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab} Page</h2>
              <p className="text-gray-600 mt-2">This is the {activeTab} page content. Select Dashboard from the sidebar to view the dashboard.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;