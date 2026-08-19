import { Component, OnInit } from '@angular/core';
import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';
import { RouterLink } from '@angular/router';
import { LoadingPreviewComponent } from '../shared/loadingPreview/loadingPreview.component';

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
  isLoading = false;
  hasError = false;

  constructor(private apisService: ApisService) {}

  ngOnInit(): void {
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

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredEntries = this.entries.filter(
      (e) =>
        e.ticketId.toLowerCase().includes(this.searchTerm) ||
        e.reporterId.toLowerCase().includes(this.searchTerm) ||
        e.faculty.toLowerCase().includes(this.searchTerm) ||
        e.description.toLowerCase().includes(this.searchTerm),
    );
  }
}
