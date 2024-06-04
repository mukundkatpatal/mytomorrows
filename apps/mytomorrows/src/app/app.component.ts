import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { BehaviorSubject } from 'rxjs';
import { MatChipsModule} from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';

import { StudiesResponse } from '@myt/models';
import { ApiclientService } from '@myt/services';

import { environment } from './app.config';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule, MatChipsModule, MatExpansionModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [ApiclientService, HttpClient]
})
export class AppComponent implements OnInit {
  title = 'mytomorrows';

  public studiesSubject = new BehaviorSubject<StudiesResponse[]>([]);
  public studiesResponse$ = this.studiesSubject.asObservable();

  constructor(private readonly service: ApiclientService) {  
  }

  public ngOnInit(): void {
    this.studiesResponse$ = this.service.getRandomStudies(this.clinicalTrialApiUrl);
  }

  private get clinicalTrialApiUrl(): string {
    let clinicalTrialsUrl = `${environment.clinicalTrialBaseUrl}${environment.clinicalTrialUrlVersion}${environment.studyResource}`;
    const columns = ['NCTId','BriefTitle','OverallStatus','StartDate','CompletionDate','StudyFirstSubmitDate'];
    const filters = '&format=json&pageSize=1';
    clinicalTrialsUrl = `${clinicalTrialsUrl}?fields=${columns.join('|')}${filters}`;
    return clinicalTrialsUrl;
  }
}
