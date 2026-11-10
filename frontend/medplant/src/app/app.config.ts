import { ViewportScroller } from '@angular/common';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })),
    provideAppInitializer(() => {
      // Hauteur de la navbar sticky (76px + bordure) pour ne pas masquer la cible d'ancre.
      inject(ViewportScroller).setOffset([0, 77]);
    }),
  ],
};
