import React from "react";

function UsageBar({ used, total }) {
  const percent = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  const remaining = Math.max(0, total - used);
  
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {remaining} remaining
      </span>
    </div>
  );
}

function SubscriptionHistory() {
  // Example static data for history
  const history = [
    {
      name: "KOL 100 with STL",
      status: "Expired",
      price: 0,
      period: "per month",
      startDate: "10/24/24",
      endDate: "1/23/25",
    },
    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },    {
      name: "Basic AI Plan",
      status: "Expired",
      price: 49,
      period: "per month",
      startDate: "7/24/24",
      endDate: "10/23/24",
    },
  ];
  return (

      
      <div className="bg-white rounded-xl shadow border p-6 border-gray-100 overflow-x-auto">
        <h4 className="text-lg font-bold mb-2">Subscription History</h4>
        <table className="w-full text-sm">
          <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th className="min-w-56 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Plan</th>
              <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Status</th>
              <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Price</th>
              <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">Start</th>
              <th className="min-w-32 text-left py-4 px-4 text-gray-700 font-semibold whitespace-nowrap text-lg bg-white">End</th>
            </tr>
          </thead>
          <tbody>
            {history.length > 0 ? (
              history.map((plan, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <td className="min-w-56 py-4 px-4 text-base text-gray-900 font-medium">{plan.name}</td>
                  <td className="min-w-32 py-4 px-4">
                    <span className={
                      plan.status === "Expired"
                        ? "bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full text-xs font-bold"
                        : "bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold"
                    }>
                      {plan.status}
                    </span>
                  </td>
                  <td className="min-w-32 py-4 px-4">${plan.price} <span className="text-xs text-gray-400">{plan.period}</span></td>
                  <td className="min-w-32 py-4 px-4">{plan.startDate}</td>
                  <td className="min-w-32 py-4 px-4">{plan.endDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 text-lg">
                  No subscription history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

  );
}

function BillingSubscription() {
  // Example static data, replace with real data as needed
  const subscription = {
    name: "Wekly AI Subscription",
    status: "Active",
    price: 0,
    period: "per month",
    startDate: "1/24/25",
    endDate: "4/24/25",
    features: [
      { label: "Pano AI Report", used: 1, total: 500 },
      { label: "CBCT AI Reports", used: 12, total: 100 },
      { label: "3D Model AI", used: 2, total: 100 },
    ],
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 border border-gray-100 max-w-xl ">
      <h3 className="text-xl font-bold mb-2">Current Subscription</h3>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">{subscription.name}</span>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full ml-2">{subscription.status}</span>
        </div>
      </div>
      <div className="divide-y divide-gray-100 mt-4">
        {subscription.features.map((f, idx) => (
          <div key={f.label} className="flex items-center justify-between py-2">
            <span className="text-gray-700 text-sm">{f.label}:</span>
            <UsageBar used={f.used} total={f.total} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
        <span>Start date: {subscription.startDate}</span>
        <span>End date: {subscription.endDate}</span>
      </div>
    </div>
  );
}

export function BillingTab({ currentClinic }) {
  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-8 w-full">
        <div className="flex-1">
          <BillingSubscription />
        </div>
        <div className="flex-1">
          <SubscriptionHistory />
        </div>
      </div>
    </div>
  );
}