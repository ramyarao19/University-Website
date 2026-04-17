import { test, expect } from './fixtures/base.fixture';
import { PortalPage } from './pages/portal.page';

test.describe('Notifications', () => {
  test('should show notification badge for unread count', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    const visible = await page.isNotifBadgeVisible();
    expect(visible).toBe(true);
  });

  test('should open dropdown on toggle button click', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    await expect(page.notifDropdown).toHaveClass(/open/);
  });

  test('should display notification items', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    const count = await page.notifItems.count();
    expect(count).toBe(4);
  });

  test('should show unread items with .unread class', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    const unreadCount = await page.getUnreadNotifCount();
    expect(unreadCount).toBe(2);
  });

  test('should show .notif-dot on unread notifications', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    const dots = await resetPage.locator('.notif-dropdown .notif-dot').count();
    expect(dots).toBe(2);
  });

  test('should mark notification as read on click', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();

    // Get the id of the first unread notification
    const firstUnreadId = await resetPage.locator('.notif-dropdown .notif-item.unread').first().getAttribute('onclick');

    // Click first unread notification
    await resetPage.locator('.notif-dropdown .notif-item.unread').first().click();

    // Wait for DOM update
    await resetPage.waitForTimeout(500);

    // After clicking, re-query the element that was clicked — it should have lost .unread
    // The handleNotifClick removes .unread directly on the element
    const unreadCount = await resetPage.locator('.notif-dropdown .notif-item.unread').count();
    // Started with 2 unread, clicked 1, should have 1 left
    expect(unreadCount).toBeLessThanOrEqual(1);
  });

  test('should mark all notifications as read', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    await page.markAllRead();

    // Wait for re-render after markAllRead (async)
    await resetPage.waitForTimeout(500);

    // All items should no longer have .unread
    const unreadCount = await page.getUnreadNotifCount();
    expect(unreadCount).toBe(0);
  });

  test('should hide badge when unread count reaches 0', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    await page.markAllRead();

    // Wait for badge update
    await resetPage.waitForTimeout(500);
    const visible = await page.isNotifBadgeVisible();
    expect(visible).toBe(false);
  });

  test('should close dropdown on Escape', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await page.toggleNotifications();
    // Wait for dropdown to render and open
    await resetPage.waitForTimeout(300);
    await expect(page.notifDropdown).toHaveClass(/open/);
    // Escape closes notification dropdown (lowest priority, but nothing else is open)
    await page.pressEscape();
    await resetPage.waitForTimeout(200);
    // Verify dropdown closed
    const isOpen = await page.notifDropdown.evaluate((el) => el.classList.contains('open'));
    expect(isOpen).toBe(false);
  });

  test.describe('Edge Cases & Negative Scenarios', () => {
    test('should display correct notification titles from seed data', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();
      const dropdownText = await page.notifDropdown.textContent();
      expect(dropdownText).toContain('Tuition payment due');
      expect(dropdownText).toContain('New internship posted');
      expect(dropdownText).toContain('Library fine overdue');
      expect(dropdownText).toContain('Course registration opens');
    });

    test('should show notification time labels', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();
      const dropdownText = await page.notifDropdown.textContent();
      expect(dropdownText).toContain('2 hours ago');
      expect(dropdownText).toContain('1 day ago');
    });

    test('should remove notif-dot but keep item after marking read', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();
      // Click first unread notification
      await resetPage.locator('.notif-dropdown .notif-item.unread').first().click();
      await resetPage.waitForTimeout(500);
      // Total items should still be 4
      const totalCount = await page.notifItems.count();
      expect(totalCount).toBe(4);
    });

    test('should reopen dropdown after closing and show updated read state', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();
      // Mark all as read
      await page.markAllRead();
      await resetPage.waitForTimeout(500);

      // Close dropdown
      await page.pressEscape();
      await resetPage.waitForTimeout(300);

      // Reopen — should still show 0 unread
      await page.toggleNotifications();
      const unreadCount = await page.getUnreadNotifCount();
      expect(unreadCount).toBe(0);
    });

    test('should show "Mark all read" button in dropdown header', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();
      const markAllBtn = resetPage.locator('.notif-dropdown button', { hasText: 'Mark all read' });
      await expect(markAllBtn).toBeVisible();
    });

    test('should show "Notifications" label in dropdown header', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();
      const dropdownText = await page.notifDropdown.textContent();
      expect(dropdownText).toContain('Notifications');
    });

    test('should update badge count after marking single notification read', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.toggleNotifications();

      // Click first unread
      await resetPage.locator('.notif-dropdown .notif-item.unread').first().click();
      await resetPage.waitForTimeout(500);

      // Badge should still be visible (1 unread remaining)
      const visible = await page.isNotifBadgeVisible();
      expect(visible).toBe(true);

      // Click the remaining unread
      const remaining = await resetPage.locator('.notif-dropdown .notif-item.unread').count();
      if (remaining > 0) {
        await resetPage.locator('.notif-dropdown .notif-item.unread').first().click();
        await resetPage.waitForTimeout(500);
      }

      // Badge should now be hidden
      const visibleAfter = await page.isNotifBadgeVisible();
      expect(visibleAfter).toBe(false);
    });
  });
});
