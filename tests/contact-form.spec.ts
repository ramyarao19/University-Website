import { test, expect } from './fixtures/base.fixture';
import { AdmissionsPage } from './pages/admissions.page';

test.describe('Contact Form', () => {
  test('should show validation errors when submitting empty form', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.submitContactForm();

    // Check all required fields show errors
    await expect(page.getFieldError('first-name')).toBeVisible();
    await expect(page.getFieldError('last-name')).toBeVisible();
    await expect(page.getFieldError('message')).toBeVisible();
  });

  test('should show error message for first-name when empty', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.submitContactForm();
    await expect(page.getErrorMessage('first-name')).toContainText('First name is required');
  });

  test('should show error message for last-name when empty', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.submitContactForm();
    await expect(page.getErrorMessage('last-name')).toContainText('Last name is required');
  });

  test('should show error message for message when empty', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.submitContactForm();
    await expect(page.getErrorMessage('message')).toContainText('Message is required');
  });

  test('should not require major field', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.fillContactForm({
      firstName: 'John',
      lastName: 'Doe',
      message: 'Hello, I have a question.',
    });
    await page.submitContactForm();
    // Major should NOT have an error
    await expect(page.getFieldError('major')).not.toBeVisible();
    // Form should succeed
    await expect(page.successScreen).toBeVisible();
  });

  test('should add .field-error class to invalid fields', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.submitContactForm();
    const firstNameHasError = await resetPage.locator('[data-field="first-name"]').evaluate(
      (el) => el.classList.contains('field-error')
    );
    expect(firstNameHasError).toBe(true);
  });

  test('should show error toast on validation failure', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.submitContactForm();
    await page.waitForToast('error');
    const msg = await page.getToastMessage('error');
    expect(msg).toContain('required fields');
  });

  test('should submit successfully with valid required fields', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.fillContactForm({
      firstName: 'Jane',
      lastName: 'Smith',
      message: 'I would like more information about the CS program.',
    });
    await page.submitContactForm();
    await expect(page.successScreen).toBeVisible();
  });

  test('should show success screen with checkmark after submission', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.fillContactForm({
      firstName: 'Jane',
      lastName: 'Smith',
      message: 'Test inquiry.',
    });
    await page.submitContactForm();
    const checkmark = resetPage.locator('#contact-form .checkmark');
    await expect(checkmark).toBeVisible();
  });

  test('should display reference ID in success screen', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.fillContactForm({
      firstName: 'Jane',
      lastName: 'Smith',
      message: 'Test inquiry.',
    });
    await page.submitContactForm();
    await expect(page.successScreen).toContainText('Reference:');
  });

  test('should show success toast on submission', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.fillContactForm({
      firstName: 'Jane',
      lastName: 'Smith',
      message: 'Test inquiry.',
    });
    await page.submitContactForm();
    await page.waitForToast('success');
    const msg = await page.getToastMessage('success');
    expect(msg).toContain('submitted successfully');
  });

  test('should submit with all fields including optional major', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.fillContactForm({
      firstName: 'Alice',
      lastName: 'Johnson',
      major: 'Computer Science',
      message: 'Interested in the CS program.',
    });
    // Scroll submit button into view and click
    await page.submitBtn.scrollIntoViewIfNeeded();
    await page.submitContactForm();
    await expect(page.successScreen).toBeVisible();
  });

  test('should clear previous errors on resubmit', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    // Submit empty — errors appear
    await page.submitContactForm();
    await expect(page.getFieldError('first-name')).toBeVisible();
    // Fill first name and resubmit — first-name error should be gone
    await page.firstName.fill('Jane');
    await page.submitContactForm();
    await expect(page.getFieldError('first-name')).not.toBeVisible();
  });

  test.describe('Edge Cases & Negative Scenarios', () => {
    test('should reject whitespace-only first name', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.fillContactForm({
        firstName: '   ',
        lastName: 'Smith',
        message: 'Hello',
      });
      await page.submitContactForm();
      await expect(page.getFieldError('first-name')).toBeVisible();
    });

    test('should reject whitespace-only last name', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.fillContactForm({
        firstName: 'Jane',
        lastName: '   ',
        message: 'Hello',
      });
      await page.submitContactForm();
      await expect(page.getFieldError('last-name')).toBeVisible();
    });

    test('should reject whitespace-only message', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.fillContactForm({
        firstName: 'Jane',
        lastName: 'Smith',
        message: '    ',
      });
      await page.submitContactForm();
      await expect(page.getFieldError('message')).toBeVisible();
    });

    test('should accept special characters in name fields', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.fillContactForm({
        firstName: "O'Brien-Smith",
        lastName: 'García',
        message: 'Testing special chars.',
      });
      await page.submitContactForm();
      await expect(page.successScreen).toBeVisible();
    });

    test('should show all three error messages simultaneously', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.submitContactForm();
      // All 3 error messages visible at once
      const errorMsgs = await resetPage.locator('#contact-form .error-msg').count();
      expect(errorMsgs).toBe(3);
    });

    test('should remove .field-error class on corrected field after resubmit', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.submitContactForm();
      // All fields have error
      await expect(page.getFieldError('first-name')).toBeVisible();
      await expect(page.getFieldError('last-name')).toBeVisible();
      await expect(page.getFieldError('message')).toBeVisible();

      // Fill all fields and resubmit
      await page.fillContactForm({
        firstName: 'Jane',
        lastName: 'Smith',
        message: 'Hello!',
      });
      await page.submitContactForm();
      // No field errors should remain
      await expect(page.getFieldError('first-name')).not.toBeVisible();
      await expect(page.getFieldError('last-name')).not.toBeVisible();
      await expect(page.getFieldError('message')).not.toBeVisible();
    });

    test('should accept very long message text', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      const longMessage = 'A'.repeat(5000);
      await page.fillContactForm({
        firstName: 'Jane',
        lastName: 'Smith',
        message: longMessage,
      });
      await page.submitContactForm();
      await expect(page.successScreen).toBeVisible();
    });

    test('should display unique reference ID on success', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.fillContactForm({
        firstName: 'Jane',
        lastName: 'Smith',
        message: 'Test.',
      });
      await page.submitContactForm();
      const successText = await page.successScreen.textContent();
      // Reference ID should be a non-empty string after "Reference:"
      expect(successText).toMatch(/Reference:\s*\S+/);
    });
  });
});
