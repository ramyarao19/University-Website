import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class AcademicsPage extends BasePage {
  readonly searchInput: Locator;
  readonly levelSelect: Locator;
  readonly areaSelect: Locator;
  readonly collegeCards: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('#academics-search');
    this.levelSelect = page.locator('#academics-level');
    this.areaSelect = page.locator('#academics-area');
    this.collegeCards = page.locator('.college-card');
  }

  async goto() {
    await this.navigateTo('academics');
  }

  async searchPrograms(query: string) {
    await this.searchInput.fill(query);
  }

  async filterByLevel(value: string) {
    await this.levelSelect.selectOption(value);
  }

  async filterByArea(value: string) {
    await this.areaSelect.selectOption(value);
  }

  async getVisibleCards(): Promise<Locator> {
    return this.page.locator('.college-card:not(.hidden-filter)');
  }

  async getVisibleCardCount(): Promise<number> {
    return this.page.locator('.college-card:not(.hidden-filter)').count();
  }

  async getHiddenCardCount(): Promise<number> {
    return this.page.locator('.college-card.hidden-filter').count();
  }

  async getTotalCardCount(): Promise<number> {
    return this.collegeCards.count();
  }

  async clearSearch() {
    await this.searchInput.fill('');
  }

  async clearFilters() {
    await this.searchInput.fill('');
    await this.levelSelect.selectOption('all');
    await this.areaSelect.selectOption('all');
  }
}
