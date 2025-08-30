import Navbar from '../component/navbar/NavBar';
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen min-w-full ">
      <Navbar />
      <div className="flex">
          {children}
    </div>
    </div>
  );
}