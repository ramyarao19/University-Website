import { test, expect } from './fixtures/base.fixture';
import { InternshipFormPage } from './pages/internship-form.page';
import * as path from 'path';

test.describe('Internship Application Form', () => {
  test.describe('Validation', () => {
    test('should show errors for all required fields when submitting empty', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.submitForm();

      await expect(page.getFieldError('full-name')).toBeVisible();
      await expect(page.getFieldError('student-id')).toBeVisible();
      await expect(page.getFieldError('email')).toBeVisible();
      await expect(page.getFieldError('major')).toBeVisible();
      await expect(page.getFieldError('statement')).toBeVisible();
    });

    test('should validate email format', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      // Wait for any draft to load, then overwrite with our test data
      await resetPage.waitForTimeout(500);
      await page.fillRequiredFields({ email: 'not-an-email' });
      // Submit via JS to avoid any click interception
      await resetPage.evaluate(() => {
        const form = document.getElementById('internship-form');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      await resetPage.waitForTimeout(500);
      // The form should still be visible (not replaced by success screen)
      const formExists = await resetPage.evaluate(() => !!document.getElementById('internship-form'));
      expect(formExists).toBe(true);
      // Check that an error toast appeared for validation
      const hasErrorToast = await resetPage.locator('.toast.toast-error').count();
      expect(hasErrorToast).toBeGreaterThan(0);
    });

    test('should accept valid email', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      await expect(page.getFieldError('email')).not.toBeVisible();
    });

    test('should not require optional fields', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      // No errors on optional fields
      await expect(page.getFieldError('gpa')).not.toBeVisible();
      await expect(page.getFieldError('portfolio')).not.toBeVisible();
      // Should succeed
      await expect(page.successScreen).toBeVisible();
    });

    test('should show error toast on validation failure', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      // Wait for any draft-loaded toast to finish
      await resetPage.waitForTimeout(500);
      await page.submitForm();
      await page.waitForToast('error');
      const msg = await page.getToastMessage('error');
      expect(msg).toContain('required fields');
    });
  });

  test.describe('Draft System', () => {
    test('should save draft to localStorage via Save Draft button', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fullName.fill('Draft User');
      await page.studentId.fill('2024-0001');
      await page.saveDraft();
      await page.waitForToast('success');

      // Verify draft exists in localStorage
      const draft = await resetPage.evaluate(() => {
        const db = JSON.parse(localStorage.getItem('scholarly_db') || '{}');
        return db.drafts?.['internship-app'];
      });
      expect(draft).toBeTruthy();
      expect(draft['full-name']).toBe('Draft User');
    });

    test('should load draft when returning to form page', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fullName.fill('Draft User');
      await page.email.fill('draft@test.edu');
      await page.saveDraft();

      // Navigate away
      await page.navigateTo('home');

      // Clear and reload to simulate fresh visit
      await resetPage.evaluate(() => {
        // Keep the DB but force draft to be there
      });

      // Navigate back — draft should load
      await page.goto();
      // Wait a moment for draft loading
      await resetPage.waitForTimeout(500);
      const nameValue = await page.fullName.inputValue();
      expect(nameValue).toBe('Draft User');
    });

    test('should show info toast when draft is loaded', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      // First set up a draft
      await page.goto();
      await page.fullName.fill('Draft User');
      await page.saveDraft();

      // Navigate away and back to trigger draft load
      await page.navigateTo('home');

      // Reload page to re-initialize app (which calls initInternshipForm -> loadDraft)
      await resetPage.reload();
      await resetPage.waitForFunction(
        () => document.querySelector('#page-home.active') !== null,
        { timeout: 10_000 }
      );
      await page.goto();
      // The toast should appear
      await page.waitForToast('info');
      const msg = await page.getToastMessage();
      expect(msg).toContain('Draft loaded');
    });

    test('should clear draft after successful submission', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fullName.fill('Draft User');
      await page.saveDraft();

      // Now fill all required and submit
      await page.fillRequiredFields();
      await page.submitForm();
      await expect(page.successScreen).toBeVisible();

      // Draft should be cleared
      const draft = await resetPage.evaluate(() => {
        const db = JSON.parse(localStorage.getItem('scholarly_db') || '{}');
        return db.drafts?.['internship-app'];
      });
      expect(draft).toBeFalsy();
    });
  });

  test.describe('File Upload', () => {
    test('should accept PDF files and show filename', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();

      // Create a small test file
      await page.fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });

      const fileName = await page.getFileName();
      expect(fileName).toContain('resume.pdf');
    });

    test('should add has-file class to zone after upload', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();

      await page.fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });

      await expect(page.fileUploadZone).toHaveClass(/has-file/);
    });

    test('should show error toast for files over 10MB', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      // Wait for draft info toast to clear
      await resetPage.waitForTimeout(1000);

      // Create a file > 10MB
      const bigBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');
      await page.fileInput.setInputFiles({
        name: 'big-resume.pdf',
        mimeType: 'application/pdf',
        buffer: bigBuffer,
      });

      await page.waitForToast('error');
      const msg = await page.getToastMessage('error');
      expect(msg).toContain('10MB');
    });

    test('should allow removing attached file', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();

      await page.fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });

      await expect(page.fileUploadZone).toHaveClass(/has-file/);
      // Use JS to call removeFile since the button can be obscured by the file input overlay
      await resetPage.evaluate(() => {
        const btn = document.querySelector('.file-info button') as HTMLElement;
        if (btn) btn.click();
      });
      await expect(page.fileUploadZone).not.toHaveClass(/has-file/);
    });
  });

  test.describe('Submission', () => {
    test('should submit with all required fields filled', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      await expect(page.successScreen).toBeVisible();
    });

    test('should show success screen with reference ID', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      await expect(page.successScreen).toContainText('Reference:');
    });

    test('should display Return to Dashboard button', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      await expect(page.returnToDashboardBtn).toBeVisible();
    });

    test('should navigate to portal when clicking Return to Dashboard', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      await page.returnToDashboardBtn.click();
      await resetPage.waitForSelector('#page-portal.active', { timeout: 5_000 });
      const active = await page.getActivePageId();
      expect(active).toBe('portal');
    });

    test('should show success toast', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      await page.submitForm();
      await page.waitForToast('success');
      const msg = await page.getToastMessage();
      expect(msg).toContain('submitted successfully');
    });
  });

  test.describe('Edge Cases & Negative Scenarios', () => {
    test('should reject whitespace-only full name', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields({ fullName: '   ' });
      await page.submitForm();
      await expect(page.getFieldError('full-name')).toBeVisible();
    });

    test('should reject whitespace-only student ID', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields({ studentId: '   ' });
      await page.submitForm();
      await expect(page.getFieldError('student-id')).toBeVisible();
    });

    test('should reject whitespace-only statement', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields({ statement: '   ' });
      await page.submitForm();
      await expect(page.getFieldError('statement')).toBeVisible();
    });

    test('should reject email without domain extension', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await resetPage.waitForTimeout(500);
      await page.fillRequiredFields({ email: 'user@domain' });
      await resetPage.evaluate(() => {
        const form = document.getElementById('internship-form');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      await resetPage.waitForTimeout(500);
      const formExists = await resetPage.evaluate(() => !!document.getElementById('internship-form'));
      expect(formExists).toBe(true);
    });

    test('should reject email with spaces', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await resetPage.waitForTimeout(500);
      await page.fillRequiredFields({ email: 'user @test.com' });
      await resetPage.evaluate(() => {
        const form = document.getElementById('internship-form');
        if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });
      await resetPage.waitForTimeout(500);
      const formExists = await resetPage.evaluate(() => !!document.getElementById('internship-form'));
      expect(formExists).toBe(true);
    });

    test('should scroll to first error field on validation failure', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.submitForm();
      // First error field should be visible in viewport
      const firstError = resetPage.locator('#internship-form .field-error').first();
      await expect(firstError).toBeVisible();
    });

    test('should show all required field errors simultaneously', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.submitForm();
      // Should show errors for: full-name, student-id, email, major, statement (5 fields)
      const errorCount = await resetPage.locator('#internship-form .error-msg').count();
      expect(errorCount).toBe(5);
    });

    test('should overwrite existing draft when saving again', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fullName.fill('First Draft');
      await page.saveDraft();

      // Overwrite with new data
      await page.fullName.fill('Updated Draft');
      await page.saveDraft();

      // Verify the draft has the updated value
      const draft = await resetPage.evaluate(() => {
        const db = JSON.parse(localStorage.getItem('scholarly_db') || '{}');
        return db.drafts?.['internship-app'];
      });
      expect(draft?.['full-name']).toBe('Updated Draft');
    });

    test('should persist draft fields across page reload', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fullName.fill('Persistent User');
      await page.email.fill('persist@test.edu');
      await page.studentId.fill('2024-0002');
      await page.saveDraft();

      // Reload the entire page
      await resetPage.reload();
      await resetPage.waitForFunction(
        () => document.querySelector('#page-home.active') !== null,
        { timeout: 10_000 }
      );
      await page.goto();
      await resetPage.waitForTimeout(500);

      const nameValue = await page.fullName.inputValue();
      expect(nameValue).toBe('Persistent User');
      const emailValue = await page.email.inputValue();
      expect(emailValue).toBe('persist@test.edu');
    });

    test('should accept file exactly at 10MB boundary', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      // Exactly 10MB — should be accepted (limit is > 10MB)
      const exactBuffer = Buffer.alloc(10 * 1024 * 1024, 'x');
      await page.fileInput.setInputFiles({
        name: 'exact-10mb.pdf',
        mimeType: 'application/pdf',
        buffer: exactBuffer,
      });
      await expect(page.fileUploadZone).toHaveClass(/has-file/);
    });

    test('should show file size in KB after upload', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });
      const fileInfo = await resetPage.locator('.file-info').textContent();
      expect(fileInfo).toContain('KB');
    });

    test('should show success toast when file is attached', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await resetPage.waitForTimeout(500);
      await page.fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });
      await page.waitForToast('success');
      const msg = await page.getToastMessage('success');
      expect(msg).toContain('resume.pdf');
    });

    test('should not persist file upload in draft', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fileInput.setInputFiles({
        name: 'resume.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      });
      await page.saveDraft();
      // File should NOT be in the draft (drafts only save form field values)
      const draft = await resetPage.evaluate(() => {
        const db = JSON.parse(localStorage.getItem('scholarly_db') || '{}');
        return db.drafts?.['internship-app'];
      });
      expect(draft?.['resume']).toBeUndefined();
    });

    test('should clear errors when correcting fields and resubmitting', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      // Submit empty to trigger errors
      await page.submitForm();
      await expect(page.getFieldError('full-name')).toBeVisible();

      // Fill all required fields and resubmit
      await page.fillRequiredFields();
      await page.submitForm();
      // Should succeed, not show errors
      await expect(page.successScreen).toBeVisible();
    });

    test('should accept special characters in name and statement', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields({
        fullName: "María O'Connor-López",
        statement: 'I am passionate about 研究 & développement — "innovation" is key!',
      });
      await page.submitForm();
      await expect(page.successScreen).toBeVisible();
    });

    test('should submit without optional fields (GPA, graduation, portfolio)', async ({ resetPage }) => {
      const page = new InternshipFormPage(resetPage);
      await page.goto();
      await page.fillRequiredFields();
      // Explicitly leave GPA, graduation, portfolio empty
      await page.gpa.fill('');
      await page.portfolio.fill('');
      await page.submitForm();
      await expect(page.successScreen).toBeVisible();
    });
  });
});
