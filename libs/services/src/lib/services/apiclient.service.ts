import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { Study } from '@myt/models';
import * as datesutils  from './dates.utils'

@Injectable({
  providedIn: 'root',
})
export class ApiclientService {

  constructor(private readonly httpClient: HttpClient) {}
  public getStudy(apiUrl: string,  fromDate: string, toDate: string): Observable<Study> {
    apiUrl = `${apiUrl}&filter.advanced=AREA[StudyFirstSubmitDate]RANGE[${fromDate},${toDate}]`;
    return this.httpClient.get<Study>(apiUrl).pipe(map((response: Study) => response));
  }

  public getRandomStudies(apiUrl: string): Observable<Study[]> {
    const requests = datesutils.generateDateRanges().map(x => this.getStudy(apiUrl, x[0], x[1]));
    return forkJoin(requests);
  }
}
