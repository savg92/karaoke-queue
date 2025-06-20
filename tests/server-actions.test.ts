import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addSinger } from '@/app/actions/add-singer';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
	__esModule: true,
	prisma: {
		event: {
			findUnique: vi.fn(),
		},
		signup: {
			findMany: vi.fn(),
			create: vi.fn(),
		},
	},
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

describe('Add Singer Integration Tests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should validate required fields', async () => {
		const formData = new FormData();
		// Missing required fields

		const result = await addSinger('test-event', formData);

		expect(result.success).toBe(false);
		expect(result.errors).toBeDefined();
	});

	it('should validate singer name', async () => {
		const formData = new FormData();
		formData.append('singerName', ''); // Empty name
		formData.append('songTitle', 'Test Song');
		formData.append('artist', 'Test Artist');
		formData.append('performanceType', 'SOLO');

		const result = await addSinger('test-event', formData);

		expect(result.success).toBe(false);
		expect(result.errors?.singerName).toBeDefined();
	});

	it('should validate song title', async () => {
		const formData = new FormData();
		formData.append('singerName', 'Test Singer');
		formData.append('songTitle', ''); // Empty song title
		formData.append('artist', 'Test Artist');
		formData.append('performanceType', 'SOLO');

		const result = await addSinger('test-event', formData);

		expect(result.success).toBe(false);
		expect(result.errors?.songTitle).toBeDefined();
	});

	it('should validate performance type', async () => {
		const formData = new FormData();
		formData.append('singerName', 'Test Singer');
		formData.append('songTitle', 'Test Song');
		formData.append('artist', 'Test Artist');
		formData.append('performanceType', 'INVALID'); // Invalid performance type

		const result = await addSinger('test-event', formData);

		expect(result.success).toBe(false);
		expect(result.errors?.performanceType).toBeDefined();
	});

	// Note: Full integration tests would require a test database
	// These tests focus on validation logic which can be tested in isolation
});

describe('Server Action Input Validation', () => {
	it('should handle FormData correctly', async () => {
		const formData = new FormData();
		formData.append('singerName', 'Valid Singer');
		formData.append('songTitle', 'Valid Song');
		formData.append('artist', 'Valid Artist');
		formData.append('performanceType', 'SOLO');
		formData.append('notes', 'Optional notes');

		// This test validates that our FormData parsing works correctly
		// The actual database interaction would be mocked in a full integration test
		const result = await addSinger('test-event', formData);

		// Since we're mocking the database, we expect this to fail
		// But the validation should have passed
		expect(result.success).toBe(false);
		// The failure should be from database interaction, not validation
		expect(result.errors?._form).toBeDefined();
	});
});
