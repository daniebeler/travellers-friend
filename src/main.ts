import { enableProdMode } from '@angular/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { platformBrowser } from '@angular/platform-browser';

if (environment.production) {
  enableProdMode();

  const script = document.createElement('script');
  script.defer = true;
  script.setAttribute('data-domain', 'travellers-friend.netlify.app');
  script.src = 'https://plausible.ghostbyte.dev/js/script.js';
  document.head.appendChild(script);
}

platformBrowser().bootstrapModule(AppModule)
  .catch(err => console.log(err));
