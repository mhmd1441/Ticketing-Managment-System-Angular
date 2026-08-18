import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Entry } from '../models/entry';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root'
})
export class ApisService {
  private localEntries: Entry[] = [];

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {}

  getEntries(): Observable<Entry[]> {
    const url = this.envService.getApiUrl('GetEntries');
    return this.http.get<Entry[]>(url).pipe(
      map(data => [...this.localEntries, ...(data || [])])
    );
  }

  getEntryById(id: string): Observable<Entry> {
  const url = this.envService.getApiUrl('GetEntryById') + '/' + id;
  return this.http.post<Entry>(url, {});
}

  submitEntry(payload: Entry): Observable<any> {
    const url = this.envService.getApiUrl('SubmitEntry');
    return this.http.post<any>(url, payload);
  }

  addLocalEntry(entry: Entry): void {
    this.localEntries.unshift(entry);
  }
}
