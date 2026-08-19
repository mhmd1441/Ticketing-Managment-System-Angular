import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { Entry } from '../models/entry';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class ApisService {
  private localEntries: Entry[] = [];
  private cachedEntries: Entry[] = [];

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
  ) {}

  getEntries(): Observable<Entry[]> {
    const url = this.envService.getApiUrl('GetEntries');
    return this.http.get<Entry[]>(url).pipe(
      map((data) => [...this.localEntries, ...(data || [])]),
      map((merged) =>
        merged.sort((a, b) => b.ticketId.localeCompare(a.ticketId)),
      ),
      tap((sorted) => (this.cachedEntries = sorted)),
    );
  }

  getEntryById(id: string): Observable<Entry> {
    const found =
      this.cachedEntries.find((e) => e.ticketId === id) ||
      this.localEntries.find((e) => e.ticketId === id);

    if (found) {
      return of(found);
    }

    const url = this.envService.getApiUrl('GetEntryById') + '/' + id;
    return this.http.post<Entry>(url, {});
  }

  submitEntry(payload: Entry): Observable<any> {
    const url = this.envService.getApiUrl('SubmitEntry');
    return this.http.post<any>(url, payload);
  }

  private ticketCounter = 4;

  generateTicketId(): string {
    const id =
      'T' +
      new Date().getFullYear() +
      String(this.ticketCounter).padStart(4, '0');
    this.ticketCounter++;
    return id;
  }

  addLocalEntry(entry: Entry): void {
    this.localEntries.unshift(entry);
  }
}
