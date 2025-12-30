/** @type {import('next').NextConfig} */
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // Hedi mohemma barcha lel deployement men ba3d
    output: 'standalone',
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://serverrouter-production.up.railway.app/api/:path*',
            },
        ]
    },
};

const analyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);