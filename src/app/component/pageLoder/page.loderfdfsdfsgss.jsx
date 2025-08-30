'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function PageLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    
    const showLoaderTimeout = setTimeout(() => {
      setLoading(true)
    }, 100)

    const hideLoaderTimeout = setTimeout(() => {
      setLoading(false)
    }, 800) 

    return () => {
      clearTimeout(showLoaderTimeout)
      clearTimeout(hideLoaderTimeout)
      setLoading(false)
    }
  }, [pathname])

  if (!loading) return null

  return (
    <div className=" poppins fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-200">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner محسن */}
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 absolute top-0 left-0"></div>
        </div>
        
        {/* نص اختياري */}
        <p className="text-gray-600 text-sm font-medium">جاري التحميل...</p>
      </div>
    </div>
  )
}