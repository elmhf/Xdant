import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function NoClinicState() {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center min-h-screen w-full bg-transparent">
            <div className="text-center max-w-md mx-auto p-6">
                <div className="mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Aucune clinique trouvée
                    </h2>
                    <p className="text-gray-600 text-lg mb-6">
                        Vous devez créer une clinique ou rejoindre une clinique existante pour gérer les patients.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => router.push('/create-clinic')}
                            className="bg-[#7564ed] hover:bg-[#6a4fd8] text-white border-2 border-[#7564ed] h-12 font-semibold px-6"
                        >
                            Créer une clinique
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
