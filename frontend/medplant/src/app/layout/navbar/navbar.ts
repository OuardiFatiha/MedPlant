import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IsActiveMatchOptions,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter } from 'rxjs';

interface NavLink {
  readonly label: string;
  readonly fragment?: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './navbar.html',
  host: {
    '(document:keydown.escape)': 'closeMenu()',
  },
})
export class NavbarComponent {
  private readonly router = inject(Router);

  protected readonly links: readonly NavLink[] = [
    { label: 'Accueil' },
    { label: 'Les plantes', fragment: 'plantes' },
    { label: 'Articles', fragment: 'articles' },
    { label: 'Nos repères', fragment: 'reperes' },
  ];

  protected readonly activeOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'exact',
    matrixParams: 'ignored',
  };

  protected readonly menuOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly accountMessage = signal('');

  protected readonly searchForm = new FormGroup({
    q: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleSearch(): void {
    this.searchOpen.update((open) => !open);
  }

  protected showAccountMessage(): void {
    this.accountMessage.set('La création de compte sera disponible dans la prochaine version.');
  }

  protected onSearch(): void {
    const q = this.searchForm.controls.q.value.trim();
    if (!q) {
      return;
    }
    this.closeMenu();
    this.searchOpen.set(false);
    void this.router.navigate(['/'], { queryParams: { q }, fragment: 'articles' });
  }
}
