export default function AuthLayout({ children }) {
    return (
      <div className="min-h-full flex items-center justify-center min-w-full relative">
        {/* Logo in top left corner */}
        <div className="absolute flex flex-row  gap-1 items-center justify-center  top-6 left-6 z-10">
          <img src="/XDENTAL.png" alt="Logo" className="h-9 rounded-2xl overflow-hidden  w-auto" />
          <h2 className="text-3xl  font-bold text-[#0d0c22]">xdents</h2>
        </div>
        {children}
      </div>
    );
  }