export default function SignupSidebar({ step, email }) {
  const steps = [
    { label: "Your details", desc: "Provide an email and password", icon: "👤" },
    { label: "Clinic info", desc: "Clinic details and location", icon: "🏥" },
    { label: "Profile & signature", desc: "Profile photo, logo, signature", icon: "🖼️" },
  ];
  return (
    <div className="h-full flex flex-col justify-between bg-white rounded-xl shadow p-6 min-w-[260px]">
      {email && (
        <div className="text-xs text-gray-500 mb-2 truncate">{email}</div>
      )}
      <div>
        <div className="text-lg font-bold mb-8 flex items-center gap-2">
          <span className="text-green-700 text-2xl">🦷</span> Xdental Signup
        </div>
        <ol className="space-y-6">
          {steps.map((s, i) => (
            <li key={i} className={`flex items-start gap-3 ${step === i ? "font-bold text-green-700" : "text-gray-500"}`}>
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className={`text-base ${step === i ? "font-bold" : "font-semibold"}`}>{s.label}{step === i && "!"}</div>
                <div className="text-xs">{s.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-8">
        <span>&larr; Back to home</span>
        <span>Sign in</span>
      </div>
    </div>
  );
} 