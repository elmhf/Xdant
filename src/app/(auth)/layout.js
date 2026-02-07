import Image from 'next/image';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-full flex items-center justify-center min-w-full relative">
      {children}
    </div>
  );
}