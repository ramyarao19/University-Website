import { test, expect } from './fixtures/base.fixture';
import { PortalPage } from './pages/portal.page';

test.describe('Portal Dashboard', () => {
  test('should display student name', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    const name = await page.getStudentName();
    expect(name).toContain('Julian Thorne');
  });

  test('should display outstanding balance', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    const balance = await page.getBalance();
    expect(balance).toContain('$1240.00');
  });

  test('should display unpaid fee items', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    const itemsText = await page.billingItems.textContent();
    expect(itemsText).toContain('Tuition');
  });

  test('should have settle fees button enabled', async ({ resetPage }) => {
    const page = new PortalPage(resetPage);
    await page.goto();
    await expect(page.settleBtn).toBeEnabled();
  });

  test.describe('Settle Fees', () => {
    test('should open modal with fee breakdown', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      const isOpen = await page.isModalOpen();
      expect(isOpen).toBe(true);
      const modalText = await page.modalBox.textContent();
      expect(modalText).toContain('Settle Outstanding Fees');
    });

    test('should show total due in modal', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      const modalText = await page.modalBox.textContent();
      expect(modalText).toContain('$1240.00');
    });

    test('should close modal on Cancel', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await resetPage.locator('#modal-overlay .modal-box button', { hasText: 'Cancel' }).click();
      const isOpen = await page.isModalOpen();
      expect(isOpen).toBe(false);
    });

    test('should mark all fees paid on Pay Now', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await page.confirmPayment();

      // Balance should be $0
      const balance = await page.getBalance();
      expect(balance).toContain('$0.00');
    });

    test('should update billing items to show all paid', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await page.confirmPayment();

      const itemsText = await page.billingItems.textContent();
      expect(itemsText).toContain('All fees are paid');
    });

    test('should disable settle button after payment', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await page.confirmPayment();

      await expect(page.settleBtn).toBeDisabled();
      await expect(page.settleBtn).toContainText('ALL PAID');
    });

    test('should show success toast after payment', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await page.confirmPayment();

      await page.waitForToast('success');
      const msg = await page.getToastMessage();
      expect(msg).toContain('settled');
    });
  });

  test.describe('Edge Cases & Negative Scenarios', () => {
    test('should show correct total from individual fee amounts (850 + 375 + 15 = 1240)', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      const balance = await page.getBalance();
      // $850 + $375 + $15 = $1240.00
      expect(balance).toContain('$1240.00');
    });

    test('should display multiple fee types in billing items', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      const itemsText = await page.billingItems.textContent();
      expect(itemsText).toContain('Tuition');
      expect(itemsText).toContain('Housing');
      expect(itemsText).toContain('Library Fine');
    });

    test('should list all fee items in settle modal', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      const modalText = await page.modalBox.textContent();
      expect(modalText).toContain('Tuition');
      expect(modalText).toContain('Housing');
      expect(modalText).toContain('Library Fine');
      expect(modalText).toContain('$850.00');
      expect(modalText).toContain('$375.00');
      expect(modalText).toContain('$15.00');
    });

    test('should maintain $0 balance after navigating away and back', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await page.confirmPayment();

      const balance1 = await page.getBalance();
      expect(balance1).toContain('$0.00');

      // Navigate away and back
      await page.navigateTo('home');
      await page.goto();

      const balance2 = await page.getBalance();
      expect(balance2).toContain('$0.00');
    });

    test('should keep settle button disabled after navigating away and back', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();
      await page.confirmPayment();

      await expect(page.settleBtn).toBeDisabled();

      // Navigate away and back
      await page.navigateTo('home');
      await page.goto();

      await expect(page.settleBtn).toBeDisabled();
    });

    test('should close settle modal without paying when Cancel is clicked', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      await page.clickSettleFees();

      // Cancel
      await resetPage.locator('#modal-overlay .modal-box button', { hasText: 'Cancel' }).click();

      // Modal closed, balance unchanged
      const isOpen = await page.isModalOpen();
      expect(isOpen).toBe(false);
      const balance = await page.getBalance();
      expect(balance).toContain('$1240.00');
    });

    test('should display student email', async ({ resetPage }) => {
      const page = new PortalPage(resetPage);
      await page.goto();
      // Email is rendered in the portal sidebar, not the main page area
      await resetPage.waitForSelector('#portal-sidebar .student-email', { timeout: 5000 });
      const emailText = await resetPage.locator('#portal-sidebar .student-email').textContent();
      expect(emailText).toContain('j.thorne@scholarly.edu');
    });
  });
});
