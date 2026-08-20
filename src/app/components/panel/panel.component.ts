import { Component, OnInit } from '@angular/core';
import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';
import { RouterLink } from '@angular/router';
import { LoadingPreviewComponent } from '../shared/loadingPreview/loadingPreview.component';
import { EnvironmentService } from '../../services/environment.service';
import { ExportService } from '../../services/export.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [RouterLink, LoadingPreviewComponent],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent implements OnInit {
  entries: Entry[] = [];
  filteredEntries: Entry[] = [];
  searchTerm = '';
  statuses: string[] = [];
  faculties: string[] = [];
  selectedStatus = '';
  selectedFaculty = '';
  isLoading = false;
  hasError = false;

  constructor(
    private apisService: ApisService,
    private envService: EnvironmentService,
    private exportService: ExportService,
  ) {}

  ngOnInit(): void {
    this.statuses = this.envService.statuses;
    this.faculties = this.envService.faculties;
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading = true;
    this.hasError = false;

    this.apisService.getEntries().subscribe({
      next: (data) => {
        this.entries = data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching entries:', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  sortColumn: 'ticketId' | 'faculty' | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  sortBy(column: 'ticketId' | 'faculty'): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }

  getSortIcon(column: 'ticketId' | 'faculty'): string {
    if (this.sortColumn !== column) return 'fas fa-sort sort-icon';
    return this.sortDirection === 'asc'
      ? 'fas fa-sort-up sort-icon active'
      : 'fas fa-sort-down sort-icon active';
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilter();
  }

  onStatusFilterChange(event: Event): void {
    this.selectedStatus = (event.target as HTMLSelectElement).value;
    this.applyFilter();
  }

  onFacultyFilterChange(event: Event): void {
    this.selectedFaculty = (event.target as HTMLSelectElement).value;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = this.entries.filter((e) => {
      const matchesSearch =
        e.ticketId.toLowerCase().includes(this.searchTerm) ||
        e.reporterId.toLowerCase().includes(this.searchTerm) ||
        e.faculty.toLowerCase().includes(this.searchTerm) ||
        e.description.toLowerCase().includes(this.searchTerm);

      const matchesStatus =
        !this.selectedStatus || e.status === this.selectedStatus;
      const matchesFaculty =
        !this.selectedFaculty || e.faculty === this.selectedFaculty;

      return matchesSearch && matchesStatus && matchesFaculty;
    });

    if (this.sortColumn) {
      const column = this.sortColumn;
      result = result.sort((a, b) => {
        const comparison = a[column].localeCompare(b[column]);
        return this.sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    this.filteredEntries = result;
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

  exportCsv(): void {
    const date = new Date().toISOString().slice(0, 10);
    this.exportService.exportToCsv(this.filteredEntries, `tickets-${date}.csv`);
  }

  exportPdf(): void {
    const date = new Date().toISOString().slice(0, 10);
    this.exportService.exportToPdf(this.filteredEntries, `tickets-${date}.pdf`);
  }
}
