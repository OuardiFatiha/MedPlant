import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { NavbarComponent } from './navbar';

describe('NavbarComponent', () => {
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;
  let el: HTMLElement;

  const link = (name: string): HTMLAnchorElement =>
    Array.from(el.querySelectorAll<HTMLAnchorElement>('nav a')).find(
      (a) => a.textContent?.trim() === name,
    ) as HTMLAnchorElement;

  const burger = (): HTMLButtonElement =>
    el.querySelector<HTMLButtonElement>('button[aria-controls="main-nav"]') as HTMLButtonElement;

  const settle = async (): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(NavbarComponent);
    el = fixture.nativeElement as HTMLElement;
    await settle();
  });

  it('renders the four navigation links with the expected hrefs', () => {
    const links = Array.from(el.querySelectorAll('nav a')).map((a) => [
      a.textContent?.trim(),
      a.getAttribute('href'),
    ]);
    expect(links).toEqual([
      ['Accueil', '/'],
      ['Les plantes', '/#plantes'],
      ['Articles', '/#articles'],
      ['Nos repères', '/#reperes'],
    ]);
  });

  it('toggles the mobile menu and aria-expanded', async () => {
    expect(burger().getAttribute('aria-expanded')).toBe('false');
    expect(burger().getAttribute('aria-label')).toBe('Ouvrir le menu');

    burger().click();
    await settle();
    expect(burger().getAttribute('aria-expanded')).toBe('true');
    expect(burger().getAttribute('aria-label')).toBe('Fermer le menu');
    expect(el.querySelector('#main-nav')?.classList).toContain('flex');

    burger().click();
    await settle();
    expect(burger().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the mobile menu on Escape', async () => {
    burger().click();
    await settle();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await settle();
    expect(burger().getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the mobile menu when a link is clicked', async () => {
    burger().click();
    await settle();

    link('Articles').click();
    await settle();
    expect(burger().getAttribute('aria-expanded')).toBe('false');
  });

  it('marks the current link with aria-current after navigating to a fragment', async () => {
    await router.navigateByUrl('/#plantes');
    await settle();

    expect(link('Les plantes').getAttribute('aria-current')).toBe('page');
    expect(link('Accueil').hasAttribute('aria-current')).toBe(false);
  });

  it('does not navigate when the search is submitted empty or blank', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const input = el.querySelector<HTMLInputElement>('input[type="search"]') as HTMLInputElement;
    const form = el.querySelector('form[role="search"]') as HTMLFormElement;

    form.dispatchEvent(new Event('submit'));
    input.value = '   ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    await settle();

    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates to the articles section with the trimmed query', async () => {
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const input = el.querySelector<HTMLInputElement>('input[type="search"]') as HTMLInputElement;
    const form = el.querySelector('form[role="search"]') as HTMLFormElement;

    input.value = '  camomille ';
    input.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    await settle();

    expect(navigate).toHaveBeenCalledWith(['/'], {
      queryParams: { q: 'camomille' },
      fragment: 'articles',
    });
  });

  it('shows the account message inline in a live region', async () => {
    const liveRegion = el.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(liveRegion.textContent?.trim()).toBe('');

    const account = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Mon espace',
    ) as HTMLButtonElement;
    account.click();
    await settle();

    expect(liveRegion.textContent).toContain(
      'La création de compte sera disponible dans la prochaine version.',
    );
  });
});
