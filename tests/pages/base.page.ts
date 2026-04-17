import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  // Navigation
  readonly nav: Locator;
  readonly navLinks: Locator;
  readonly hamburgerBtn: Locator;
  readonly mobileMenu: Locator;

  // Search
  readonly searchOverlay: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;

  // Modal
  readonly modalOverlay: Locator;
  readonly modalBox: Locator;

  // Toast
  readonly toastContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator('#site-nav');
    this.navLinks = page.locator('.nav-link');
    this.hamburgerBtn = page.locator('#hamburger-btn');
    this.mobileMenu = page.locator('#mobile-menu');
    this.searchOverlay = page.locator('#search-overlay');
    this.searchInput = page.locator('#search-overlay .search-input');
    this.searchResults = page.locator('#search-overlay .search-result-item');
    this.modalOverlay = page.locator('#modal-overlay');
    this.modalBox = page.locator('#modal-overlay .modal-box');
    this.toastContainer = page.locator('#toast-container');
  }

  async navigateTo(pageName: string) {
    await this.page.evaluate((p) => navigate(p), pageName);
    await this.page.waitForSelector(`#page-${pageName}.active`, { timeout: 5_000 });
  }

  async getActivePageId(): Promise<string> {
    const el = this.page.locator('.page.active');
    const id = await el.getAttribute('id');
    return id?.replace('page-', '') || '';
  }

  async clickNavLink(pageName: string) {
    await this.page.locator(`[data-page="${pageName}"]`).click();
    await this.page.waitForSelector(`#page-${pageName}.active`, { timeout: 5_000 });
  }

  async openSearch() {
    await this.page.keyboard.press('Control+k');
    await expect(this.searchOverlay).toHaveClass(/open/);
  }

  async closeSearch() {
    await this.page.keyboard.press('Escape');
    await expect(this.searchOverlay).not.toHaveClass(/open/);
  }

  async searchFor(query: string) {
    await this.searchInput.fill(query);
  }

  isModalOpen() {
    return this.modalOverlay.evaluate((el) => el.classList.contains('open'));
  }

  async closeModal() {
    await this.page.evaluate(() => closeModal());
  }

  async waitForToast(type?: string) {
    const selector = type ? `.toast.toast-${type}.show` : '.toast.show';
    return this.page.waitForSelector(selector, { timeout: 5_000 });
  }

  async getToastMessage(type?: string) {
    const selector = type ? `.toast.toast-${type}.show` : '.toast.show';
    const toast = this.page.locator(selector).last();
    return toast.locator('span').last().textContent();
  }

  async pressEscape() {
    await this.page.keyboard.press('Escape');
  }

  async getDocumentTitle() {
    return this.page.title();
  }
}
