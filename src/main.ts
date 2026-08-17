// src/main.ts
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', 'travellers-friend.netlify.app');
  script.src = 'https://plausible.ghostbyte.dev/js/script.js';
  document.head.appendChild(script);
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
