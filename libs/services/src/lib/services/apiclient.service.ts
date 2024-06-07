import { HttpClient } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { StudiesResponse } from '@myt/models';
import * as datesutils from './dates.utils';

export interface IStudiesService {
  getRandomStudies(apiUrl: string, maxRange?: number): Observable<StudiesResponse[]>;
}

export const STUDIES_SERVICE_TOKEN = new InjectionToken<IStudiesService>('IStudiesService');
@Injectable()
export class ApiClientService implements IStudiesService {
  constructor(private readonly httpClient: HttpClient) {}
  private getStudy(
    apiUrl: string,
    fromDate: string,
    toDate: string
  ): Observable<StudiesResponse> {
    apiUrl = `${apiUrl}&filter.advanced=AREA[StudyFirstSubmitDate]RANGE[${fromDate},${toDate}]`;
    return this.httpClient.get<StudiesResponse>(apiUrl).pipe(map((response: StudiesResponse) => response));
  }

  public getRandomStudies(apiUrl: string, maxRange = 10): Observable<StudiesResponse[]> {
    const requests = datesutils
      .generateDateRanges(undefined, undefined, maxRange)
      .map((x) => this.getStudy(apiUrl, x[0], x[1]));
    return forkJoin(requests);
  }
}
