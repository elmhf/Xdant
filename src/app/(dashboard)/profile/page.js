import AccountInfoCard from "@/components/features/profile/profile"

export default function Page() {
  return (
    <div className="bg-transparent w-full px-4">
      {/* Header Section */}
      <div className="bg-transparent">
        <div className="">
          <div className="text-start">
            <h2 className="text-3xl md:text-4xl font-[900] text-gray-900 mb-2">
              Mon Profil
            </h2>
            <p className="text-gray-600 text-lg">
              Gérez vos informations personnelles, sécurité et signature
            </p>
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