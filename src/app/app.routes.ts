import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { PanelComponent } from './components/panel/panel.component';

export const routes: Routes = [
  { path: '', redirectTo: 'form', pathMatch: 'full' },
  { path: 'form', component: FormComponent },
  { path: 'panel', component: PanelComponent },
];
