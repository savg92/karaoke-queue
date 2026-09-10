import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
	// Disable telemetry
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
	// External packages that should be handled by the server
	serverExternalPackages: ['@prisma/client'],
	// Enable experimental features for better performance
	experimental: {
		optimizePackageImports: [
			'@radix-ui/react-dialog',
			'@radix-ui/react-dropdown-menu',
			'@radix-ui/react-select',
		],
	},
	// Turbopack configuration
	turbopack: {
		resolveAlias: {
			// Alias for common imports
			'@': './src',
			'@prisma/client': './prisma/generated/browser',
		},
	},
	// Bundle optimization
	webpack: (config, { isServer }) => {
		if (!isServer) {
			// Client-side optimizations
			config.resolve.fallback = { fs: false, net: false, tls: false };
		}

		// Enhanced LightningCSS support for Vercel deployment
		config.externals = config.externals || [];
		config.externals.push({
			lightningcss: 'lightningcss',
			'@parcel/watcher': '@parcel/watcher',
		});

		// Resolve native modules and Prisma v7 generated client
		config.resolve.alias = {
			...config.resolve.alias,
			'@prisma/client$': isServer
				? path.resolve(process.cwd(), 'prisma/generated/client')
				: path.resolve(process.cwd(), 'prisma/generated/browser'),
			'.prisma/client/index-browser': path.resolve(process.cwd(), 'prisma/generated/browser'),
			'.prisma/client': isServer
				? path.resolve(process.cwd(), 'prisma/generated/client')
				: path.resolve(process.cwd(), 'prisma/generated/browser'),
		};

		// Help webpack handle native binaries
		config.module.rules.push({
			test: /\.node$/,
			loader: 'node-loader',
		});

		return config;
	},
};

export default nextConfig;
