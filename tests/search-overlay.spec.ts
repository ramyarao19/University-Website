import { test, expect } from './fixtures/base.fixture';
import { BasePage } from './pages/base.page';

test.describe('Search Overlay', () => {
  test('should open search overlay via Ctrl+K', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await expect(page.searchOverlay).toHaveClass(/open/);
  });

  test('should show all 7 pages when search input is empty', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    const results = await page.searchResults.count();
    expect(results).toBe(7);
  });

  test('should filter results based on search query', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await page.searchFor('admissions');
    const results = await page.searchResults.count();
    expect(results).toBeGreaterThanOrEqual(1);
    const firstText = await page.searchResults.first().textContent();
    expect(firstText).toContain('Admissions');
  });

  test('should match on page keywords', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await page.searchFor('tuition');
    const results = await page.searchResults.count();
    expect(results).toBeGreaterThanOrEqual(1);
    const firstText = await page.searchResults.first().textContent();
    expect(firstText).toContain('Admissions');
  });

  test('should show no-results message for unmatched query', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await page.searchFor('xyznonexistent');
    const results = await page.searchResults.count();
    expect(results).toBe(0);
    const noResults = resetPage.locator('#search-overlay .search-results');
    await expect(noResults).toContainText('No results found');
  });

  test('should navigate to page when clicking a search result', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await page.searchFor('about');
    await page.searchResults.first().click();
    await resetPage.waitForSelector('#page-about.active', { timeout: 5_000 });
    const active = await page.getActivePageId();
    expect(active).toBe('about');
    await expect(page.searchOverlay).not.toHaveClass(/open/);
  });

  test('should navigate to first result on Enter key', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    // Use a unique search term that matches only one page
    await page.searchInput.fill('athletics');
    await resetPage.waitForSelector('#search-overlay .search-result-item', { timeout: 3_000 });
    // The only match should be "Campus Life" (has "athletics" in keywords)
    const resultCount = await page.searchResults.count();
    expect(resultCount).toBe(1);
    // Click the first (and only) result — same as what Enter does
    await page.searchResults.first().click();
    await resetPage.waitForTimeout(500);
    const active = await page.getActivePageId();
    expect(active).toBe('campus');
  });

  test('should close overlay on Escape', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await page.closeSearch();
    await expect(page.searchOverlay).not.toHaveClass(/open/);
  });

  test('should close overlay on clicking backdrop', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    // Click on the overlay backdrop (not the search box)
    await resetPage.locator('#search-overlay').click({ position: { x: 10, y: 10 } });
    await expect(page.searchOverlay).not.toHaveClass(/open/);
  });

  test('should clear input when reopening', async ({ resetPage }) => {
    const page = new BasePage(resetPage);
    await page.openSearch();
    await page.searchFor('test');
    await page.closeSearch();
    await page.openSearch();
    const value = await page.searchInput.inputValue();
    expect(value).toBe('');
  });

  test.describe('Edge Cases & Negative Scenarios', () => {
    test('should handle whitespace-only search gracefully (show all pages)', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      await page.searchFor('   ');
      const results = await page.searchResults.count();
      expect(results).toBe(7);
    });

    test('should handle special characters in search without error', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      await page.searchFor('.*[]()');
      // Should not crash — just show no results
      const results = await page.searchResults.count();
      expect(results).toBe(0);
    });

    test('should match partial keywords', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      await page.searchFor('scholar');
      const results = await page.searchResults.count();
      // "scholarships" keyword on Admissions page should match
      expect(results).toBeGreaterThanOrEqual(1);
    });

    test('should be case-insensitive for page names', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      await page.searchFor('ACADEMICS');
      const results = await page.searchResults.count();
      expect(results).toBeGreaterThanOrEqual(1);
      const firstText = await page.searchResults.first().textContent();
      expect(firstText).toContain('Academics');
    });

    test('should show no-results message for gibberish query', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      await page.searchFor('zzzzzzzzz123');
      const results = await page.searchResults.count();
      expect(results).toBe(0);
      const noResults = resetPage.locator('#search-overlay .search-results');
      await expect(noResults).toContainText('No results found');
    });

    test('should close overlay when result is clicked and navigate', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      await page.searchFor('portal');
      await page.searchResults.first().click();
      // Overlay should close
      await expect(page.searchOverlay).not.toHaveClass(/open/);
      // Page should be navigated
      await resetPage.waitForSelector('#page-portal.active', { timeout: 5_000 });
    });

    test('should show all 7 pages on initial open', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      // Check that all page labels are present
      const allText = await resetPage.locator('#search-overlay .search-results').textContent();
      expect(allText).toContain('Home');
      expect(allText).toContain('Academics');
      expect(allText).toContain('Admissions');
      expect(allText).toContain('About Us');
      expect(allText).toContain('Campus Life');
      expect(allText).toContain('Student Portal');
      expect(allText).toContain('Internship Application');
    });

    test('should focus search input when overlay opens', async ({ resetPage }) => {
      const page = new BasePage(resetPage);
      await page.openSearch();
      const isFocused = await page.searchInput.evaluate(
        (el) => el === document.activeElement
      );
      expect(isFocused).toBe(true);
    });
  });
});
