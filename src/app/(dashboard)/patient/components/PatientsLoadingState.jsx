export default function PatientsLoadingState() {
    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="mb-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#7564ed] mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Chargement des patients
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Veuillez patienter pendant le chargement des patients...
                    </p>
                </div>
            </div>
        </div>
    );
}
