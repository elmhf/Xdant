"use client"
import AccountInfoCard from "@/components/features/profile/profile"
import { useTranslation } from "react-i18next"

export default function Page() {
  const { t } = useTranslation()

  return (
    <div className="bg-transparent w-full px-4">
      {/* Header Section */}
      <div className="bg-transparent">
        <div className="">
          <div className="text-start">
            <h2 className="text-3xl md:text-4xl font-[700] text-gray-900 mb-6 mt-6">
              {t('profile.title')}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        <AccountInfoCard />
      </div>
    </div>
  )
}