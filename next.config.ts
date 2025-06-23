import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'i.ytimg.com',
				port: '',
				pathname: '/vi/**',
			},
		],
	},
	// Performance optimizations
	compress: true,
	poweredByHeader: false,
	// Enable experimental features for better performance
	experimental: {
		optimizePackageImports: [
			'@radix-ui/react-dialog',
			'@radix-ui/react-dropdown-menu',
			'@radix-ui/react-select',
		],
	},
	// Turbopack configuration (stable in Next.js 15+)
	turbopack: {
		resolveAlias: {
			// Alias for common imports
			'@': './src',
		},
	},
	// Bundle optimization
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Client-side optimizations
			config.resolve.fallback = { fs: false, net: false, tls: false };
		}
		return config;
	},
};

export default nextConfig;
