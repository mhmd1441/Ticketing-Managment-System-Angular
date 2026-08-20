import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';
import { LoadingPreviewComponent } from '../shared/loadingPreview/loadingPreview.component';
import { EnvironmentService } from '../../services/environment.service';
import { FormsModule } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink, LoadingPreviewComponent, FormsModule, DatePipe],
  templateUrl: './ticketDetail.component.html',
  styleUrl: './ticketDetail.component.css',
})
export class TicketDetailComponent implements OnInit {
  entry: Entry | null = null;
  statuses: string[] = [];
  selectedStatus = '';
  isUpdating = false;
  isLoading = false;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private apisService: ApisService,
    private envService: EnvironmentService,
  ) {}

  ngOnInit(): void {
    this.statuses = this.envService.statuses;
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEntry(id);
    }
  }

  loadEntry(id: string): void {
    this.isLoading = true;
    this.hasError = false;

    this.apisService.getEntryById(id).subscribe({
      next: (data) => {
        this.entry = data;
        this.selectedStatus = data.status;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching entry:', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
  getStatusClass(status: string): string {
    switch (status) {
      case 'Assigned':
        return 'badge badge-secondary';
      case 'In Progress':
        return 'badge badge-info';
      case 'Pending':
        return 'badge badge-warning';
      case 'Escalated':
        return 'badge badge-danger';
      case 'Solved':
        return 'badge badge-success';
      default:
        return 'badge badge-light';
    }
  }

  showToast(
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'danger' = 'success',
  ): void {
    const icon = {
      success: 'fas fa-check-circle',
      info: 'fas fa-info-circle',
      warning: 'fas fa-exclamation-triangle',
      danger: 'fas fa-times-circle',
    }[type];

    $(document).Toasts('create', {
      class: `bg-${type}`,
      title,
      subtitle: 'Just now',
      body: message,
      icon,
      autohide: true,
      delay: 5000,
    });
  }

  updateStatus(): void {
    if (!this.entry) return;

    this.isUpdating = true;
    this.apisService.updateStatus(this.entry.ticketId, this.selectedStatus);
    this.entry.status = this.selectedStatus;
    this.showToast(
      'Status Updated',
      `Ticket ${this.entry.ticketId} is now ${this.selectedStatus}`,
      'success',
    );
    this.isUpdating = false;
  }
}
