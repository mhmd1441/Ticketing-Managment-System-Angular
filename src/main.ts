// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

const cacheBuster = `v=${Date.now()}`;

fetch(`config.json?${cacheBuster}`)
  .then(response => response.json())
  .then(config => {
    (window as any).__env = config;
    bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
  })
  .catch(err => console.error('Could not load config.json'));