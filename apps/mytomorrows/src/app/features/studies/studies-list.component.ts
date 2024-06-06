import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  from,
  interval,
  map,
  mergeMap,
  switchMap,
  tap,
  toArray,
} from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';

import { StudyFlat } from '@myt/models';
import {
  ApiclientService,
  FAVORITES_SERVICE_TOKEN,
  FavoritesServiceArrayStore,
  IFavoritesService,
  STUDIES_SERVICE_TOKEN,
} from '@myt/services';

import { environment } from '../../app.config';
@Component({
  selector: 'myt-studies-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatChipsModule,
    MatExpansionModule,
    MatToolbarModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './studies-list.component.html',
  styleUrl: './studies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ HttpClient,
    { provide: FAVORITES_SERVICE_TOKEN, useExisting: FavoritesServiceArrayStore },
    { provide: STUDIES_SERVICE_TOKEN, useClass: ApiclientService },
  ],
})
export class StudiesListComponent implements OnInit, OnDestroy {
  public studiesSubject = new BehaviorSubject<StudyFlat[]>([]);
  public studiesFlat$ = this.studiesSubject.asObservable();

  private intervalSubscription?: Subscription;

  public checked = false;

  constructor(
    @Inject(STUDIES_SERVICE_TOKEN) private readonly service: ApiclientService,
    @Inject(FAVORITES_SERVICE_TOKEN)
    private readonly favoritesService: IFavoritesService
  ) {}

  public ngOnInit(): void {
    this.service
      .getRandomStudies(this.clinicalTrialApiUrl)
      .pipe(
        map((x) =>
          x.map((y) =>
            y.studies.map((k) => {
              return {
                briefTitle: k.protocolSection.identificationModule.briefTitle,
                ntcId: k.protocolSection.identificationModule.nctId,
                completionDate:
                  k?.protocolSection?.statusModule?.completionDateStruct?.date,
                overallStatus: k.protocolSection.statusModule.overallStatus,
                startDate:
                  k?.protocolSection?.statusModule?.startDateStruct?.date,
                studyFirstSumbmitDate:
                  k?.protocolSection?.statusModule?.studyFirstSubmitDate,
              } as StudyFlat;
            })
          )
        ),
        mergeMap((arrays) =>
          from(arrays).pipe(
            mergeMap((innerArray) => from(innerArray)),
            toArray()
          )
        )
      ).subscribe((studiesFlat: StudyFlat[]) => {
        // Update the BehaviorSubject with the new values
        this.studiesSubject.next(studiesFlat);
      });
      this.studiesFlat$ = this.studiesSubject.asObservable();
  }

  public onAddToFavorite(study: StudyFlat, $event: MouseEvent): void {
    this.favoritesService.addFavorite(study);
    $event.stopPropagation();
  }

  public onToggleChange($event: MatSlideToggleChange): void {
    console.log($event.checked);
    if ($event.checked) {
      this.intervalSubscription = interval(3000).pipe(
        switchMap(() => this.service.getRandomStudies(this.clinicalTrialApiUrl, 1)))
        .pipe(
          map((x) =>
            x.map((y) =>
              y.studies.map((k) => {
                return {
                  briefTitle: k.protocolSection.identificationModule.briefTitle,
                  ntcId: k.protocolSection.identificationModule.nctId,
                  completionDate:
                    k?.protocolSection?.statusModule?.completionDateStruct?.date,
                  overallStatus: k.protocolSection.statusModule.overallStatus,
                  startDate:
                    k?.protocolSection?.statusModule?.startDateStruct?.date,
                  studyFirstSumbmitDate:
                    k?.protocolSection?.statusModule?.studyFirstSubmitDate,
                } as StudyFlat;
              })
            )
          ),
          mergeMap((arrays) =>
            from(arrays).pipe(
              mergeMap((innerArray) => from(innerArray)),
              toArray()
            )
          )
        )
        .subscribe(x => {
          const currentvalues = this.studiesSubject.value;
          if (currentvalues.length > 1) {
            currentvalues.pop();
            currentvalues.unshift(x[0]);
            this.studiesSubject.next(currentvalues);
          }
        });
    } else {
      this.intervalSubscription?.unsubscribe();
    }
  }

  public   ngOnDestroy(): void {
      this.intervalSubscription?.unsubscribe();
  }

  private get clinicalTrialApiUrl(): string {
    let clinicalTrialsUrl = `${environment.clinicalTrialBaseUrl}${environment.clinicalTrialUrlVersion}${environment.studyResource}`;
    const columns = [
      'NCTId',
      'BriefTitle',
      'OverallStatus',
      'StartDate',
      'CompletionDate',
      'StudyFirstSubmitDate',
    ];
    const filters = '&format=json&pageSize=1';
    clinicalTrialsUrl = `${clinicalTrialsUrl}?fields=${columns.join(
      '|'
    )}${filters}`;
    return clinicalTrialsUrl;
  }
}
