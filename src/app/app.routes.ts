import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { PanelComponent } from './components/panel/panel.component';
import { TicketDetailComponent } from './components/ticketDetail/ticketDetail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'form', pathMatch: 'full' },
  { path: 'form', component: FormComponent },
  { path: 'panel', component: PanelComponent },
  { path: 'panel/:id', component: TicketDetailComponent },
];
