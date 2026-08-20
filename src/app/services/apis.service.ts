import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, tap } from 'rxjs';
import { Entry } from '../models/entry';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class ApisService {
  private readonly STORAGE_KEY = 'localTickets';
  private localEntries: Entry[] = [];
  private cachedEntries: Entry[] = [];
  private ticketCounter = 4;
  private statusOverrides: Record<string, string> = {};
  private endDateOverrides: Record<string, string> = {};

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService,
  ) {
    this.localEntries = this.getFromSession(this.STORAGE_KEY) || [];
    this.statusOverrides = this.getFromSession('statusOverrides') || {};
    this.endDateOverrides = this.getFromSession('endDateOverrides') || {};
    this.ticketCounter = this.calculateNextCounter();
  }

  saveToSession(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  getFromSession(key: string): any {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private calculateNextCounter(): number {
    if (this.localEntries.length === 0) return 4;
    const numbers = this.localEntries.map((e) =>
      parseInt(e.ticketId.slice(-4), 10),
    );
    return Math.max(...numbers) + 1;
  }

  generateTicketId(): string {
    const id =
      'T' +
      new Date().getFullYear() +
      String(this.ticketCounter).padStart(4, '0');
    this.ticketCounter++;
    return id;
  }

  getEntries(): Observable<Entry[]> {
    const url = this.envService.getApiUrl('GetEntries');
    return this.http.get<Entry[]>(url).pipe(
      map((data) => [...this.localEntries, ...(data || [])]),
      map((merged) =>
        merged.map((e) => {
          const hasEndDateOverride = e.ticketId in this.endDateOverrides;
          return {
            ...e,
            status: this.statusOverrides[e.ticketId] || e.status,
            endDate: hasEndDateOverride
              ? this.endDateOverrides[e.ticketId] || undefined
              : e.endDate,
          };
        }),
      ),
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

  addLocalEntry(entry: Entry): void {
    this.localEntries.unshift(entry);
    this.saveToSession(this.STORAGE_KEY, this.localEntries);
  }

  updateStatus(ticketId: string, newStatus: string): void {
  this.statusOverrides[ticketId] = newStatus;
  this.saveToSession('statusOverrides', this.statusOverrides);

  this.endDateOverrides[ticketId] =
    newStatus === 'Solved' ? new Date().toISOString() : '';
  this.saveToSession('endDateOverrides', this.endDateOverrides);

  const endDateValue = this.endDateOverrides[ticketId] || undefined;

  const localMatch = this.localEntries.find((e) => e.ticketId === ticketId);
  if (localMatch) {
    localMatch.status = newStatus;
    localMatch.endDate = endDateValue;
    this.saveToSession(this.STORAGE_KEY, this.localEntries);
  }

  const cachedMatch = this.cachedEntries.find((e) => e.ticketId === ticketId);
  if (cachedMatch) {
    cachedMatch.status = newStatus;
    cachedMatch.endDate = endDateValue;
  }
}
}
