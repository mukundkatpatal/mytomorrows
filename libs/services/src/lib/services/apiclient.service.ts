import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { StudiesResponse } from '@myt/models';
import * as datesutils from './dates.utils';

@Injectable({
  providedIn: 'root',
})
export class ApiclientService {
  constructor(private readonly httpClient: HttpClient) {}
  public getStudy(
    apiUrl: string,
    fromDate: string,
    toDate: string
  ): Observable<StudiesResponse> {
    apiUrl = `${apiUrl}&filter.advanced=AREA[StudyFirstSubmitDate]RANGE[${fromDate},${toDate}]`;
    return this.httpClient.get<StudiesResponse>(apiUrl).pipe(map((response: StudiesResponse) => response));
  }

  public getRandomStudies(apiUrl: string): Observable<StudiesResponse[]> {
    const requests = datesutils
      .generateDateRanges()
      .map((x) => this.getStudy(apiUrl, x[0], x[1]));
    return forkJoin(requests);
  }
}
