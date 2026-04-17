import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class InternshipFormPage extends BasePage {
  readonly form: Locator;
  readonly fullName: Locator;
  readonly studentId: Locator;
  readonly email: Locator;
  readonly majorField: Locator;
  readonly gpa: Locator;
  readonly graduation: Locator;
  readonly portfolio: Locator;
  readonly statement: Locator;
  readonly fileUploadZone: Locator;
  readonly fileInput: Locator;
  readonly saveDraftBtn: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.locator('#internship-form');
    this.fullName = page.locator('#internship-form [data-field="full-name"]');
    this.studentId = page.locator('#internship-form [data-field="student-id"]');
    this.email = page.locator('#internship-form [data-field="email"]');
    this.majorField = page.locator('#internship-form [data-field="major"]');
    this.gpa = page.locator('#internship-form [data-field="gpa"]');
    this.graduation = page.locator('#internship-form [data-field="graduation"]');
    this.portfolio = page.locator('#internship-form [data-field="portfolio"]');
    this.statement = page.locator('#internship-form [data-field="statement"]');
    this.fileUploadZone = page.locator('.file-upload-zone');
    this.fileInput = page.locator('.file-upload-zone input[type="file"]');
    this.saveDraftBtn = page.locator('button', { hasText: 'Save Draft' });
    this.submitBtn = page.locator('#internship-form button[type="submit"]');
  }

  async goto() {
    await this.navigateTo('internship-form');
  }

  async fillRequiredFields(data?: Partial<{
    fullName: string; studentId: string; email: string; major: string; statement: string;
  }>) {
    const defaults = {
      fullName: 'Jane Doe',
      studentId: '2024-9999',
      email: 'jane@scholarly.edu',
      major: 'Computer Science',
      statement: 'I am passionate about software engineering and eager to contribute to innovative projects.',
    };
    const d = { ...defaults, ...data };
    await this.fullName.fill(d.fullName);
    await this.studentId.fill(d.studentId);
    await this.email.fill(d.email);
    await this.majorField.fill(d.major);
    await this.statement.fill(d.statement);
  }

  async submitForm() {
    await this.submitBtn.click();
  }

  async saveDraft() {
    await this.saveDraftBtn.click();
  }

  getFieldError(fieldName: string) {
    return this.page.locator(`#internship-form [data-field="${fieldName}"].field-error`);
  }

  getErrorMessage(fieldName: string) {
    return this.page.locator(`#internship-form [data-field="${fieldName}"]`).locator('..').locator('.error-msg');
  }

  get successScreen() {
    return this.page.locator('.form-success');
  }

  get returnToDashboardBtn() {
    return this.page.locator('button', { hasText: 'Return to Dashboard' });
  }

  async getFileName(): Promise<string> {
    return (await this.page.locator('.file-name-display').textContent()) || '';
  }

  async removeFile() {
    await this.page.locator('.file-info button').click();
  }
}
