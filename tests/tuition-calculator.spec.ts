import { test, expect } from './fixtures/base.fixture';
import { AdmissionsPage } from './pages/admissions.page';

test.describe('Tuition Calculator', () => {
  test('should display $0/year by default', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$0');
  });

  test('should show CALCULATE button text', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await expect(page.calculateBtn).toContainText('CALCULATE');
  });

  test('should calculate in-state in-person on-campus ($44,100)', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('In-State Resident');
    await page.selectModality('In-Person');
    await page.selectHousing('On-Campus Dormitory');
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$44,100');
  });

  test('should calculate out-of-state in-person off-campus ($55,300)', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('Out-of-State');
    await page.selectModality('In-Person');
    await page.selectHousing('Off-Campus');
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$55,300');
  });

  test('should calculate international online ($33,400)', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('International');
    await page.selectModality('Online');
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$33,400');
  });

  test('should calculate in-state in-person family ($31,300)', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('In-State Resident');
    await page.selectModality('In-Person');
    await page.selectHousing('Living with Family');
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$31,300');
  });

  test('should calculate in-state online ($18,500)', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('In-State Resident');
    await page.selectModality('Online');
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$18,500');
  });

  test('should disable housing select when Online is chosen', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectModality('Online');
    const disabled = await page.isHousingDisabled();
    expect(disabled).toBe(true);
    const opacity = await page.getHousingOpacity();
    expect(opacity).toBe('0.4');
  });

  test('should re-enable housing when switching back to In-Person', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectModality('Online');
    expect(await page.isHousingDisabled()).toBe(true);
    await page.selectModality('In-Person');
    expect(await page.isHousingDisabled()).toBe(false);
    const opacity = await page.getHousingOpacity();
    expect(opacity).toBe('1');
  });

  test('should show breakdown with tuition, fees, and housing lines', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('In-State Resident');
    await page.selectModality('In-Person');
    await page.selectHousing('On-Campus Dormitory');
    const breakdown = await page.getBreakdownText();
    expect(breakdown).toContain('Tuition');
    expect(breakdown).toContain('Fees');
    expect(breakdown).toContain('Housing');
  });

  test('should hide housing line for online students', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('International');
    await page.selectModality('Online');
    const breakdown = await page.getBreakdownText();
    expect(breakdown).toContain('Tuition');
    expect(breakdown).toContain('Fees');
    expect(breakdown).not.toContain('Housing');
    expect(breakdown).toContain('Online students are not charged housing fees');
  });

  test('should show $0 when residency is not selected', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectModality('In-Person');
    await page.selectHousing('On-Campus Dormitory');
    const total = await page.getDisplayedTotal();
    expect(total).toBe('$0');
  });

  test('should show toast when CALCULATE clicked with incomplete selections', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.clickCalculate();
    await page.waitForToast('error');
    const msg = await page.getToastMessage();
    expect(msg).toContain('required fields');
  });

  test('should reset calculator when navigating away from admissions', async ({ resetPage }) => {
    const page = new AdmissionsPage(resetPage);
    await page.goto();
    await page.selectResidency('In-State Resident');
    await page.selectModality('In-Person');
    await page.selectHousing('On-Campus Dormitory');
    const total1 = await page.getDisplayedTotal();
    expect(total1).toBe('$44,100');

    // Navigate away and back
    await page.navigateTo('home');
    await page.navigateTo('admissions');

    const total2 = await page.getDisplayedTotal();
    expect(total2).toBe('$0');
  });

  test.describe('Edge Cases', () => {
    test('should toggle housing disabled state through Online→In-Person→Online cycle', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      // Start In-Person, housing enabled
      await page.selectModality('In-Person');
      expect(await page.isHousingDisabled()).toBe(false);
      // Switch to Online, housing disabled
      await page.selectModality('Online');
      expect(await page.isHousingDisabled()).toBe(true);
      // Switch back to In-Person, housing re-enabled
      await page.selectModality('In-Person');
      expect(await page.isHousingDisabled()).toBe(false);
      // Switch to Online again
      await page.selectModality('Online');
      expect(await page.isHousingDisabled()).toBe(true);
      expect(await page.getHousingOpacity()).toBe('0.4');
    });

    test('should show $0 when only modality is selected (no residency)', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectModality('In-Person');
      const total = await page.getDisplayedTotal();
      expect(total).toBe('$0');
    });

    test('should show $0 when only housing is selected (no residency or modality)', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectHousing('On-Campus Dormitory');
      const total = await page.getDisplayedTotal();
      expect(total).toBe('$0');
    });

    test('should show error toast when CALCULATE clicked with only residency selected', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('In-State Resident');
      await page.clickCalculate();
      await page.waitForToast('error');
      const msg = await page.getToastMessage('error');
      expect(msg).toContain('required fields');
    });

    test('should calculate correctly for out-of-state online ($27,100)', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('Out-of-State');
      await page.selectModality('Online');
      const total = await page.getDisplayedTotal();
      expect(total).toBe('$27,100');
    });

    test('should calculate correctly for international in-person off-campus ($66,100)', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('International');
      await page.selectModality('In-Person');
      await page.selectHousing('Off-Campus');
      const total = await page.getDisplayedTotal();
      expect(total).toBe('$66,100');
    });

    test('should calculate correctly for international in-person family ($56,500)', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('International');
      await page.selectModality('In-Person');
      await page.selectHousing('Living with Family');
      const total = await page.getDisplayedTotal();
      expect(total).toBe('$56,500');
    });

    test('should reset housing selection when switching to Online', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('In-State Resident');
      await page.selectModality('In-Person');
      await page.selectHousing('On-Campus Dormitory');
      // Verify calculation includes housing
      const total1 = await page.getDisplayedTotal();
      expect(total1).toBe('$44,100');
      // Switch to Online — housing should be reset and excluded
      await page.selectModality('Online');
      const total2 = await page.getDisplayedTotal();
      expect(total2).toBe('$18,500');
    });

    test('should auto-calculate on dropdown change without clicking CALCULATE', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('In-State Resident');
      await page.selectModality('In-Person');
      await page.selectHousing('On-Campus Dormitory');
      // Total should update automatically on dropdown change
      const total = await page.getDisplayedTotal();
      expect(total).toBe('$44,100');
    });

    test('should clear breakdown when navigating away and back', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('In-State Resident');
      await page.selectModality('In-Person');
      await page.selectHousing('On-Campus Dormitory');
      let breakdown = await page.getBreakdownText();
      expect(breakdown).toContain('Tuition');

      await page.navigateTo('home');
      await page.navigateTo('admissions');

      breakdown = await page.getBreakdownText();
      expect(breakdown).toBe('');
    });

    test('should show info toast when CALCULATE clicked with valid selections', async ({ resetPage }) => {
      const page = new AdmissionsPage(resetPage);
      await page.goto();
      await page.selectResidency('In-State Resident');
      await page.selectModality('In-Person');
      await page.selectHousing('On-Campus Dormitory');
      await page.clickCalculate();
      await page.waitForToast('info');
      const msg = await page.getToastMessage('info');
      expect(msg).toContain('updated');
    });
  });
});
