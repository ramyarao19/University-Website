import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AdmissionsPage extends BasePage {
  // Tuition calculator
  readonly residencySelect: Locator;
  readonly modalitySelect: Locator;
  readonly housingSelect: Locator;
  readonly tuitionDisplay: Locator;
  readonly tuitionBreakdown: Locator;
  readonly calculateBtn: Locator;

  // Contact form
  readonly contactForm: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly major: Locator;
  readonly message: Locator;
  readonly submitBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.residencySelect = page.locator('#tuition-residency');
    this.modalitySelect = page.locator('#tuition-modality');
    this.housingSelect = page.locator('#tuition-housing');
    this.tuitionDisplay = page.locator('#tuition-display');
    this.tuitionBreakdown = page.locator('#tuition-breakdown');
    this.calculateBtn = page.locator('#tuition-recalc');
    this.contactForm = page.locator('#contact-form');
    this.firstName = page.locator('#contact-form [data-field="first-name"]');
    this.lastName = page.locator('#contact-form [data-field="last-name"]');
    this.major = page.locator('#contact-form [data-field="major"]');
    this.message = page.locator('#contact-form [data-field="message"]');
    this.submitBtn = page.locator('#contact-form button[type="submit"]');
  }

  async goto() {
    await this.navigateTo('admissions');
  }

  async selectResidency(label: string) {
    await this.residencySelect.selectOption({ label });
  }

  async selectModality(label: string) {
    await this.modalitySelect.selectOption({ label });
  }

  async selectHousing(label: string) {
    await this.housingSelect.selectOption({ label });
  }

  async clickCalculate() {
    await this.calculateBtn.click();
  }

  async getDisplayedTotal(): Promise<string> {
    const text = await this.tuitionDisplay.textContent();
    // Extract just the dollar amount, e.g. "$44,100"
    const match = text?.match(/\$[\d,]+/);
    return match ? match[0] : '$0';
  }

  async getBreakdownText(): Promise<string> {
    return (await this.tuitionBreakdown.textContent()) || '';
  }

  async isHousingDisabled(): Promise<boolean> {
    return this.housingSelect.isDisabled();
  }

  async getHousingOpacity(): Promise<string> {
    return this.housingSelect.evaluate((el) => (el as HTMLElement).style.opacity);
  }

  async fillContactForm(data: { firstName: string; lastName: string; major?: string; message: string }) {
    await this.firstName.fill(data.firstName);
    await this.lastName.fill(data.lastName);
    if (data.major) await this.major.fill(data.major);
    await this.message.fill(data.message);
  }

  async submitContactForm() {
    await this.submitBtn.click();
  }

  getFieldError(fieldName: string) {
    return this.page.locator(`[data-field="${fieldName}"].field-error`);
  }

  getErrorMessage(fieldName: string) {
    return this.page.locator(`[data-field="${fieldName}"]`).locator('..').locator('.error-msg');
  }

  get successScreen() {
    return this.page.locator('#contact-form .form-success');
  }
}
