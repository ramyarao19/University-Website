import { test, expect } from './fixtures/base.fixture';
import { AcademicsPage } from './pages/academics.page';

test.describe('Academics Filter', () => {
  test('should show all college cards by default', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    const total = await page.getTotalCardCount();
    const visible = await page.getVisibleCardCount();
    expect(total).toBeGreaterThan(0);
    expect(visible).toBe(total);
  });

  test('should filter cards by search text', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    const totalBefore = await page.getTotalCardCount();
    await page.searchPrograms('engineering');
    const visible = await page.getVisibleCardCount();
    expect(visible).toBeGreaterThan(0);
    expect(visible).toBeLessThanOrEqual(totalBefore);
  });

  test('should be case-insensitive search', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    await page.searchPrograms('ENGINEERING');
    const upperVisible = await page.getVisibleCardCount();
    await page.searchPrograms('engineering');
    const lowerVisible = await page.getVisibleCardCount();
    expect(upperVisible).toBe(lowerVisible);
  });

  test('should filter cards by level dropdown', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    await page.filterByLevel('graduate');
    const visible = await page.getVisibleCardCount();
    const hidden = await page.getHiddenCardCount();
    expect(visible).toBeGreaterThan(0);
    // At least some should be hidden if there are undergraduate-only cards
    expect(visible + hidden).toBe(await page.getTotalCardCount());
  });

  test('should filter cards by area dropdown', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    await page.filterByArea('stem');
    const visible = await page.getVisibleCardCount();
    expect(visible).toBeGreaterThan(0);
  });

  test('should combine search + level + area filters', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    const total = await page.getTotalCardCount();
    await page.filterByLevel('graduate');
    await page.filterByArea('stem');
    const visible = await page.getVisibleCardCount();
    expect(visible).toBeLessThanOrEqual(total);
  });

  test('should add .hidden-filter class to non-matching cards', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    await page.searchPrograms('xyznonexistent');
    const hidden = await page.getHiddenCardCount();
    const total = await page.getTotalCardCount();
    expect(hidden).toBe(total);
  });

  test('should show all cards when filters are cleared', async ({ resetPage }) => {
    const page = new AcademicsPage(resetPage);
    await page.goto();
    const totalBefore = await page.getTotalCardCount();
    await page.searchPrograms('xyznonexistent');
    expect(await page.getVisibleCardCount()).toBe(0);
    await page.clearFilters();
    const visibleAfter = await page.getVisibleCardCount();
    expect(visibleAfter).toBe(totalBefore);
  });

  test.describe('Edge Cases & Negative Scenarios', () => {
    test('should handle whitespace-only search (show all cards)', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      const total = await page.getTotalCardCount();
      await page.searchPrograms('   ');
      // Whitespace search is effectively empty after .toLowerCase(), which includes everything
      const visible = await page.getVisibleCardCount();
      expect(visible).toBe(total);
    });

    test('should handle special characters in search without crashing', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      await page.searchPrograms('[].*()');
      // Should not crash — uses .includes() not regex
      const visible = await page.getVisibleCardCount();
      expect(visible).toBeGreaterThanOrEqual(0);
    });

    test('should filter by level and restore all when reset to "all"', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      const totalBefore = await page.getTotalCardCount();
      await page.filterByLevel('graduate');
      const filteredCount = await page.getVisibleCardCount();
      expect(filteredCount).toBeLessThanOrEqual(totalBefore);

      // Reset level to all
      await page.filterByLevel('all');
      const afterReset = await page.getVisibleCardCount();
      expect(afterReset).toBe(totalBefore);
    });

    test('should filter by area and restore all when reset to "all"', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      const totalBefore = await page.getTotalCardCount();
      await page.filterByArea('stem');
      const filteredCount = await page.getVisibleCardCount();
      expect(filteredCount).toBeLessThanOrEqual(totalBefore);

      await page.filterByArea('all');
      const afterReset = await page.getVisibleCardCount();
      expect(afterReset).toBe(totalBefore);
    });

    test('should show 0 visible cards when no cards match combined filters', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      // Apply very restrictive search that won't match anything
      await page.searchPrograms('xyznonexistent');
      await page.filterByLevel('graduate');
      const visible = await page.getVisibleCardCount();
      expect(visible).toBe(0);
    });

    test('should filter in real-time as user types', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      const totalBefore = await page.getTotalCardCount();
      // Type one character at a time
      await page.searchPrograms('e');
      const afterE = await page.getVisibleCardCount();
      expect(afterE).toBeGreaterThan(0);
      expect(afterE).toBeLessThanOrEqual(totalBefore);
    });

    test('should maintain filter state when clearing only search', async ({ resetPage }) => {
      const page = new AcademicsPage(resetPage);
      await page.goto();
      await page.filterByLevel('graduate');
      const withLevel = await page.getVisibleCardCount();
      // Add search then clear it
      await page.searchPrograms('test');
      await page.clearSearch();
      // Level filter should still be active
      const afterClear = await page.getVisibleCardCount();
      expect(afterClear).toBe(withLevel);
    });
  });
});
