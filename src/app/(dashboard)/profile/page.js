import AccountInfoCard from "../../component/profile/profile"

export default function Page() {
  return (
    <div className="bg-transparent w-full">
      {/* Header Section */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="text-start">
            <h2 className="text-3xl md:text-4xl font-[900] text-gray-900 mb-2">
              Mes paramètres personnels
            </h2>
            <p className="text-gray-600 text-lg">
              Gérez vos informations personnelles et préférences
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
        <AccountInfoCard />
      </div>
    </div>
  )
}