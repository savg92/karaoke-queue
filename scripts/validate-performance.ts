#!/usr/bin/env bun

/**
 * Performance Validation Script
 * Run this to verify all performance optimizations are working correctly
 */

import { performance } from 'perf_hooks';

console.log('🚀 Karaoke Queue Performance Validation\n');

// Test 1: Performance Monitoring Utilities
console.log('🔍 Testing Performance Monitoring...');
try {
	const { measureDatabaseQuery, withPerformanceMonitoring } = await import(
		'../src/lib/performance'
	);

	// Test database query monitoring
	const start = performance.now();
	const testQuery = () => Promise.resolve('test data');
	await measureDatabaseQuery('test-query', testQuery);
	const duration = performance.now() - start;

	console.log(
		`✅ Database query monitoring working (${duration.toFixed(2)}ms)`
	);

	// Test server action monitoring
	const testAction = async (input: string) => `processed: ${input}`;
	const monitoredAction = withPerformanceMonitoring('test-action', testAction);
	const result = await monitoredAction('test');

	console.log(`✅ Server action monitoring working: ${result}`);
} catch (error) {
	console.log('❌ Performance monitoring error:', error);
}

// Test 2: TypeScript Compilation Speed
console.log('\n⚡ Testing TypeScript Performance...');
const tsStart = performance.now();
try {
	// Import a complex TypeScript file to test compilation speed
	await import('../src/app/(dashboard)/dashboard/[eventSlug]/types');
	const tsEnd = performance.now();
	const tsDuration = tsEnd - tsStart;

	if (tsDuration < 100) {
		console.log(`✅ TypeScript compilation fast: ${tsDuration.toFixed(2)}ms`);
	} else {
		console.log(`⚠️  TypeScript compilation slow: ${tsDuration.toFixed(2)}ms`);
	}
} catch (error) {
	console.log('❌ TypeScript compilation error:', error);
}

// Test 3: React Query Configuration
console.log('\n🔄 Checking React Query Setup...');
try {
	const { createPerformanceQueryClient } = await import(
		'../src/lib/performance'
	);
	const queryClient = createPerformanceQueryClient();

	const defaultOptions = queryClient.getDefaultOptions();
	console.log(`✅ Query stale time: ${defaultOptions.queries?.staleTime}ms`);
	console.log(`✅ Query GC time: ${defaultOptions.queries?.gcTime}ms`);

	if (defaultOptions.queries?.staleTime === 30000) {
		console.log('✅ Optimal caching configuration detected');
	} else {
		console.log('⚠️  Non-optimal caching configuration');
	}
} catch (error) {
	console.log('❌ React Query configuration error:', error);
}

console.log('\n🎉 Performance validation complete!');
console.log('\n💡 Next steps:');
console.log('   1. Run `bun run dev` to test Turbopack performance');
console.log('   2. Run `bun run analyze` to check bundle size');
console.log('   3. Test real-time sync by editing signups in different tabs');
console.log('   4. Monitor browser console for performance warnings');
