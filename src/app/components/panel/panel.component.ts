import { Component, OnInit } from '@angular/core';
import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent implements OnInit {
  entries: Entry[] = [];
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching entries:', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }
}
