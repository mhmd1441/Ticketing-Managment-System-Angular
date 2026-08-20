import { ApisService } from '../../services/apis.service';
import { Entry } from '../../models/entry';
import { LoadingPreviewComponent } from '../shared/loadingPreview/loadingPreview.component';
import {
  Component,
  OnInit,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';

declare var Chart: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [LoadingPreviewComponent],
  templateUrl: './adminDashboard.component.html',
  styleUrl: './adminDashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, AfterViewChecked {
  entries: Entry[] = [];
  filtered: Entry[] = [];
  fromDate = '';
  toDate = '';
  isLoading = false;
  hasError = false;
  private charts: any[] = [];
  private pendingRender = false;
  totalTickets = 0;
  topFaculty = '—';
  topChannel = '—';

  @ViewChild('facultyChart') facultyCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('channelChart') channelCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('tagChart') tagCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryCanvas?: ElementRef<HTMLCanvasElement>;

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
        this.applyDateFilter();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.hasError = true;
        this.isLoading = false;
      },
    });
  }

  onFromChange(event: Event): void {
    this.fromDate = (event.target as HTMLInputElement).value;
    this.applyDateFilter();
  }

  onToChange(event: Event): void {
    this.toDate = (event.target as HTMLInputElement).value;
    this.applyDateFilter();
  }

  clearDates(): void {
    this.fromDate = '';
    this.toDate = '';
    this.applyDateFilter();
  }

  applyDateFilter(): void {
    this.filtered = this.entries.filter((e) => {
      const t = new Date(e.startDate).getTime();
      const okFrom = !this.fromDate || t >= new Date(this.fromDate).getTime();
      const okTo =
        !this.toDate || t <= new Date(this.toDate + 'T23:59:59').getTime();
      return okFrom && okTo;
    });
    this.updateKpis();
    this.pendingRender = true;
  }

  private countBy(pick: (e: Entry) => string): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const e of this.filtered) {
      const key = pick(e) || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }

  private countTags(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const e of this.filtered) {
      for (const tag of e.tags || []) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return counts;
  }

  private updateKpis(): void {
    this.totalTickets = this.filtered.length;
    this.topFaculty = this.topKey(this.countBy((e) => e.faculty));
    this.topChannel = this.topKey(this.countBy((e) => e.channel));
  }

  private topKey(counts: Record<string, number>): string {
    const entries = Object.entries(counts);
    if (entries.length === 0) return '—';
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }
  ngAfterViewChecked(): void {
    if (!this.pendingRender) return;

    if (this.filtered.length === 0) {
      this.pendingRender = false;
      return;
    }

    if (
      this.facultyCanvas &&
      this.channelCanvas &&
      this.tagCanvas &&
      this.categoryCanvas
    ) {
      this.pendingRender = false;
      this.renderCharts();
    }
  }
  private renderCharts(): void {
    this.charts.forEach((c) => c.destroy());
    this.charts = [];
    if (this.filtered.length === 0) return;
    const faculty = this.countBy((e) => e.faculty);
    const channel = this.countBy((e) => e.channel);
    const category = this.countBy((e) => e.category);
    const tags = this.countTags();

    const brand = '#1a4a7a';
    const palette = [
      '#1a4a7a',
      '#28a745',
      '#ffc107',
      '#dc3545',
      '#17a2b8',
      '#6c757d',
      '#6610f2',
      '#fd7e14',
    ];
    const earthyPalette = [
      '#1A365D',
      '#2B6CB0',
      '#2C5282',
      '#4C51BF',
      '#2D3748',
      '#4A5568',
      '#718096',
      '#3182CE',
    ];

    const darkPalette = [
      '#1E293B',
      '#334155',
      '#475569',
      '#101e3f',
      '#3B82F6',
      '#64748B',
      '#94A3B8',
      '#CBD5E1',
    ];

    const mutedPallete = ['#16A085', '#27AE60', '#27AE80', '#29b473'];

    if (
      !this.facultyCanvas ||
      !this.channelCanvas ||
      !this.tagCanvas ||
      !this.categoryCanvas
    )
      return;

    const facultyEl = this.facultyCanvas.nativeElement;
    const channelEl = this.channelCanvas.nativeElement;
    const categoryEl = this.categoryCanvas.nativeElement;
    const tagEl = this.tagCanvas.nativeElement;

    this.charts.push(
      new Chart(facultyEl, {
        type: 'bar',
        data: {
          labels: Object.keys(faculty),
          datasets: [
            {
              label: 'Tickets',
              data: Object.values(faculty),
              backgroundColor: earthyPalette,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 14, padding: 12 },
            },
          },
        },
      }),
    );

    this.charts.push(
      new Chart(channelEl, {
        type: 'pie',
        data: {
          labels: Object.keys(channel),
          datasets: [
            { data: Object.values(channel), backgroundColor: palette },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      }),
    );

    this.charts.push(
      new Chart(categoryEl, {
        type: 'bar',
        data: {
          labels: Object.keys(category),
          datasets: [
            {
              label: 'Tickets',
              data: Object.values(category),
              backgroundColor: mutedPallete,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      }),
    );

    this.charts.push(
      new Chart(tagEl, {
        type: 'bar',
        data: {
          labels: Object.keys(tags),
          datasets: [
            {
              label: 'Tickets',
              data: Object.values(tags),
              backgroundColor: darkPalette,
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      }),
    );
  }
}
