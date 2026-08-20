import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { PanelComponent } from './components/panel/panel.component';
import { TicketDetailComponent } from './components/ticketDetail/ticketDetail.component';
import { AdminDashboardComponent } from './components/AdminDashboard/adminDashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'AdminDashboard', pathMatch: 'full' },
  { path: 'AdminDashboard', component: AdminDashboardComponent },
  { path: 'AdminDashboard/form', component: FormComponent },
  { path: 'AdminDashboard/panel', component: PanelComponent },
  { path: 'AdminDashboard/panel/:id', component: TicketDetailComponent },
];
