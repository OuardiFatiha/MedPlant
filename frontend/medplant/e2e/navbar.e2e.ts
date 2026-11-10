import { expect, test } from '@playwright/test';

test.describe('navbar desktop (1280px)', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('affiche la navbar, la rend sticky et navigue vers une ancre', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('app-navbar header');
    await expect(header).toBeVisible();
    await expect(page.getByRole('link', { name: 'Les plantes' })).toBeVisible();
    await expect(page.getByRole('searchbox')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Mon espace' })).toBeVisible();

    await page.evaluate(() => {
      const section = document.createElement('section');
      section.id = 'plantes';
      section.style.height = '2000px';
      document.querySelector('main')?.prepend(section);
    });

    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(header).toHaveCSS('position', 'sticky');
    await expect(header).toBeInViewport();

    await page.getByRole('link', { name: 'Les plantes' }).click();
    await expect(page).toHaveURL(/\/#plantes$/);
    const sectionTop = await page.evaluate(
      () => document.getElementById('plantes')!.getBoundingClientRect().top,
    );
    expect(sectionTop).toBeGreaterThanOrEqual(0);
    expect(sectionTop).toBeLessThan(120);
  });

  test('le premier élément focusable est le lien d’évitement', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Aller au contenu' })).toBeFocused();
  });
});

test.describe('navbar mobile (375px)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('le menu s’ouvre, se ferme au clic sur un lien et à Échap', async ({ page }) => {
    await page.goto('/');

    const burger = page.getByRole('button', { name: 'Ouvrir le menu' });
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await burger.click();
    await expect(page.getByRole('button', { name: 'Fermer le menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.getByRole('link', { name: 'Articles' })).toBeVisible();

    await page.getByRole('link', { name: 'Articles' }).click();
    await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(page.getByRole('link', { name: 'Articles' })).toBeHidden();

    await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
    await expect(page.getByRole('link', { name: 'Articles' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await expect(page.getByRole('link', { name: 'Articles' })).toBeHidden();
  });
});
