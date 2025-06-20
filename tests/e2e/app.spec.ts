import { test, expect } from '@playwright/test';

test.describe('Karaoke Queue Application', () => {
	test('should load the homepage', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Karaoke Queue/);
	});

	test('should display navigation links', async ({ page }) => {
		await page.goto('/');

		// Check for login link
		await expect(
			page.locator('text=Host Login').or(page.locator('text=Login'))
		).toBeVisible();
	});

	test('should navigate to login page', async ({ page }) => {
		await page.goto('/');

		// Click login link
		await page.click('text=Host Login, text=Login');

		// Should be on login page
		await expect(page.url()).toContain('/login');
		await expect(
			page.locator('text=Email').or(page.locator('input[type="email"]'))
		).toBeVisible();
	});

	test('attendee signup flow', async ({ page }) => {
		// Navigate to a test event signup page
		await page.goto('/event/test-event');

		// Check if signup form is visible
		await expect(page.locator('form')).toBeVisible();

		// Fill out signup form
		await page.fill('input[name="singerName"]', 'Test Singer');
		await page.fill('input[name="songTitle"]', 'Test Song');
		await page.fill('input[name="artist"]', 'Test Artist');

		// Select performance type if dropdown exists
		const performanceTypeSelect = page.locator(
			'select[name="performanceType"]'
		);
		if (await performanceTypeSelect.isVisible()) {
			await performanceTypeSelect.selectOption('SOLO');
		}

		// Submit form
		await page.click('button[type="submit"]');

		// Check for success message or confirmation
		await expect(
			page
				.locator('text=success')
				.or(page.locator('text=added').or(page.locator('text=signed up')))
		).toBeVisible({ timeout: 10000 });
	});

	test('should handle invalid signup data', async ({ page }) => {
		await page.goto('/event/test-event');

		// Try to submit empty form
		await page.click('button[type="submit"]');

		// Should show validation errors
		await expect(
			page
				.locator('text=required')
				.or(page.locator('.error').or(page.locator('[role="alert"]')))
		).toBeVisible();
	});
});

test.describe('Host Dashboard', () => {
	test('should redirect to login when accessing dashboard without auth', async ({
		page,
	}) => {
		await page.goto('/dashboard/test-event');

		// Should redirect to login
		await expect(page.url()).toContain('/login');
	});

	// Note: Full host dashboard tests would require authentication setup
	// These can be expanded once we have a test authentication flow
});
