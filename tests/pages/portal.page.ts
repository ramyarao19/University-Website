import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class PortalPage extends BasePage {
  readonly billingBalance: Locator;
  readonly billingItems: Locator;
  readonly settleBtn: Locator;
  readonly studentName: Locator;
  readonly appCountBadge: Locator;
  readonly notifBadge: Locator;
  readonly notifDropdown: Locator;
  readonly notifItems: Locator;

  constructor(page: Page) {
    super(page);
    this.billingBalance = page.locator('#page-portal .billing-balance');
    this.billingItems = page.locator('#page-portal .billing-items');
    this.settleBtn = page.locator('#page-portal .settle-btn');
    this.studentName = page.locator('#portal-sidebar .student-name');
    this.appCountBadge = page.locator('.app-count-badge');
    this.notifBadge = page.locator('.notif-badge').first();
    this.notifDropdown = page.locator('.notif-dropdown').first();
    this.notifItems = page.locator('.notif-dropdown .notif-item');
  }

  async goto() {
    await this.navigateTo('portal');
    // Wait for portal data to load (async refreshPortalData)
    await this.page.waitForFunction(
      () => {
        const el = document.querySelector('#page-portal .billing-balance');
        return el && el.textContent && /\$\d/.test(el.textContent);
      },
      { timeout: 10_000 }
    );
  }

  async getBalance(): Promise<string> {
    return (await this.billingBalance.textContent()) || '';
  }

  async getStudentName(): Promise<string> {
    return (await this.studentName.textContent()) || '';
  }

  async clickSettleFees() {
    await this.settleBtn.click();
  }

  async confirmPayment() {
    // Click "Pay Now" button in the modal
    await this.page.locator('#modal-overlay .modal-box button', { hasText: 'Pay Now' }).click();
  }

  async toggleNotifications() {
    await this.page.locator('#page-portal [onclick*="toggleNotifications"]').click();
    // Wait for notification items to render (async DB call)
    await this.page.waitForFunction(
      () => document.querySelectorAll('.notif-dropdown .notif-item').length > 0,
      { timeout: 5_000 }
    );
  }

  async getUnreadNotifCount(): Promise<number> {
    return this.page.locator('.notif-dropdown .notif-item.unread').count();
  }

  async clickNotification(index: number) {
    await this.page.locator('.notif-dropdown .notif-item').nth(index).click();
  }

  async markAllRead() {
    await this.page.locator('.notif-dropdown button', { hasText: 'Mark all read' }).click();
  }

  async isNotifBadgeVisible(): Promise<boolean> {
    const display = await this.notifBadge.evaluate((el) => getComputedStyle(el).display);
    return display !== 'none';
  }
}
