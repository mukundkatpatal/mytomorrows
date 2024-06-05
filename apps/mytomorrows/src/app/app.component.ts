import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { BehaviorSubject, Observable, from, map, mergeMap, toArray } from 'rxjs';
import { MatChipsModule} from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatToolbarModule} from '@angular/material/toolbar';

import { StudiesResponse, StudyFlat } from '@myt/models';
import { ApiclientService } from '@myt/services';

import { environment } from './app.config';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatChipsModule, MatExpansionModule, MatToolbarModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiclientService, HttpClient]
})
export class AppComponent implements OnInit {
  title = 'mytomorrows';

  public studiesSubject = new BehaviorSubject<StudiesResponse[]>([]);
  public studiesFlat$!: Observable<StudyFlat[]>; 

  constructor(private readonly service: ApiclientService) {  
  }

  public ngOnInit(): void {
    this.studiesFlat$ = this.service.getRandomStudies(this.clinicalTrialApiUrl).pipe(
    map(x => x.map(y => y.studies.map(k => {
      return {
        briefTitle: k.protocolSection.identificationModule.briefTitle,
        ntcId: k.protocolSection.identificationModule.nctId,
        completionDate: k?.protocolSection?.statusModule?.completionDateStruct?.date,
        overallStatus: k.protocolSection.statusModule.overallStatus,
        startDate: k?.protocolSection?.statusModule?.startDateStruct?.date,
        studyFirstSumbmitDate:  k?.protocolSection?.statusModule?.studyFirstSubmitDate
      } as StudyFlat
    }))),
    mergeMap(arrays => from(arrays).pipe(
      mergeMap(innerArray => from(innerArray)),
      toArray()
    )));
    
  }

  private get clinicalTrialApiUrl(): string {
    let clinicalTrialsUrl = `${environment.clinicalTrialBaseUrl}${environment.clinicalTrialUrlVersion}${environment.studyResource}`;
    const columns = ['NCTId','BriefTitle','OverallStatus','StartDate','CompletionDate','StudyFirstSubmitDate'];
    const filters = '&format=json&pageSize=1';
    clinicalTrialsUrl = `${clinicalTrialsUrl}?fields=${columns.join('|')}${filters}`;
    return clinicalTrialsUrl;
  }
}
