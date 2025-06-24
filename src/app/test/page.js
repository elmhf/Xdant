"use client"
// ExamplePage.jsx
import React, { useState } from "react";

const packages = [
  {
    id: "1",
    from: "Florence",
    to: "Stockholm",
    status: "PACKED",
    orderId: "#1B498-98018",
  },
  {
    id: "2",
    from: "Norra Nynäshamn",
    to: "Stockholm",
    status: "IN TRANSIT",
    orderId: "#29698-98971",
    courier: {
      name: "Harris Whitaker",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    sender: "Amazon",
    departed: "15 Dec 03:27 PM",
    distance: "1246 km",
    weight: "5.2 kg",
    currentLocation: "Farsta, Sweden",
    lastStop: "6 hours ago",
    details: "Delivery history and details",
  },
  {
    id: "3",
    from: "Dresden",
    to: "Stockholm",
    status: "IN TRANSIT",
    orderId: "#04948-98367",
  },
  {
    id: "4",
    from: "Helsinki",
    to: "Stockholm",
    status: "IN TRANSIT",
    orderId: "#14398-98719",
  },
  {
    id: "5",
    from: "Warsaw",
    to: "Stockholm",
    status: "DELIVERED",
    orderId: "#25398-98001",
  },
  {
    id: "6",
    from: "Hamburg",
    to: "Stockholm",
    status: "DELIVERED",
    orderId: "#25398-98001",
  },
];

const statusColors = {
  "PACKED": "bg-purple-200 text-purple-700",
  "IN TRANSIT": "bg-lime-200 text-lime-700",
  "DELIVERED": "bg-gray-200 text-gray-700",
};

export default function ExamplePage() {
  const [selected, setSelected] = useState(packages[1]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">Packages</h2>
          <button className="p-2 rounded-full hover:bg-gray-100">
            <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="2" fill="#888" /></svg>
          </button>
        </div>
        {/* Tabs */}
        <div className="flex gap-2 px-6 py-4">
          <button className="px-4 py-2 rounded-full bg-black text-white font-semibold">On the way</button>
          <button className="px-4 py-2 rounded-full text-gray-500 font-semibold">Delivered</button>
        </div>
        {/* Packages List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {packages.map(pkg => (
            <div
              key={pkg.id}
              className={`rounded-2xl bg-white shadow-sm border border-gray-100 p-4 cursor-pointer transition-all ${selected.id === pkg.id ? "ring-2 ring-black" : ""}`}
              onClick={() => setSelected(pkg)}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{pkg.from} <span className="text-gray-400">→</span> {pkg.to}</div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[pkg.status]}`}>{pkg.status}</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">{pkg.orderId}</div>
              {/* تفاصيل إضافية للطرد المحدد */}
              {selected.id === pkg.id && pkg.courier && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <img src={pkg.courier.avatar} alt="" className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-sm font-semibold">{pkg.courier.name}</div>
                      <div className="text-xs text-gray-400">Courier</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <div><span className="font-bold text-gray-700">Sender:</span> {pkg.sender}</div>
                    <div><span className="font-bold text-gray-700">Departed:</span> {pkg.departed}</div>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <div><span className="font-bold text-gray-700">Distance:</span> {pkg.distance}</div>
                    <div><span className="font-bold text-gray-700">Weight:</span> {pkg.weight}</div>
                  </div>
                  <button className="w-full mt-2 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm">Delivery history and details</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        {/* صورة بدل الخريطة */}
        <div className="flex-1 relative">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Map"
            className="w-full h-full object-cover"
          />
          {/* عنوان المدينة فوق الصورة */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl font-bold text-gray-800 drop-shadow-lg">
            {selected.to}
          </div>
        </div>
        {/* تفاصيل الطرد المحدد أسفل الصورة */}
        <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-6 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-gray-400">Order ID {selected.orderId}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColors[selected.status]}`}>{selected.status}</span>
              <span className="text-gray-700 font-semibold">{selected.from} → {selected.to}</span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Current Location: <span className="font-bold text-gray-700">{selected.currentLocation || "-"}</span></span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Distance: <span className="font-bold text-gray-700">{selected.distance || "-"}</span></span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">Last Stop: <span className="font-bold text-gray-700">{selected.lastStop || "-"}</span></span>
            </div>
          </div>
          <button className="px-4 py-2 rounded-full bg-black text-white font-semibold shadow hover:bg-gray-900">Contact courier</button>
        </div>
      </main>
    </div>
  );
}