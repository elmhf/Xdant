import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function ReportLoading({ message = 'Loading...', reportId, imageCard, icon = '📄', lottie = true }) {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="relative flex flex-col items-center">
        <div className="w-100 h-100">
          {lottie ? (
            <Lottie
              animationData={require('@/app/Lottie/Insider-loading.json')}
              loop
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <span className="text-6xl">{icon}</span>
          )}
        </div>

      </div>
    </div>
  );
}
