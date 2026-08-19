import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';
import { LoadingPreviewComponent } from '../shared/loadingPreview/loadingPreview.component';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [RouterLink,LoadingPreviewComponent],
  templateUrl: './ticketDetail.component.html',
  styleUrl: './ticketDetail.component.css'
})
export class TicketDetailComponent implements OnInit {
  entry: Entry | null = null;
  isLoading = false;
  hasError = false;

  constructor(
    private route: ActivatedRoute,
    private apisService: ApisService
  ) {}

  ngOnInit(): void {
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
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching entry:', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }
}
