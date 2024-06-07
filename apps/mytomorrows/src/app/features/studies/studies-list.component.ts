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
  toArray,
} from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';

import { StudiesResponse, Study, StudyFlat } from '@myt/models';
import {
  FAVORITES_SERVICE_TOKEN,
  FavoritesServiceArrayStore,
  ApiClientService,
  IFavoritesService,
  STUDIES_SERVICE_TOKEN,
  IStudiesService,
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
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './studies-list.component.html',
  styleUrl: './studies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    HttpClient,
    {
      provide: FAVORITES_SERVICE_TOKEN,
      useExisting: FavoritesServiceArrayStore,
    },
    { provide: STUDIES_SERVICE_TOKEN, useClass: ApiClientService },
  ],
})
export class StudiesListComponent implements OnInit, OnDestroy {
  public studiesSubject = new BehaviorSubject<StudyFlat[]>([]);
  public studiesFlat$ = this.studiesSubject.asObservable();
  private intervalSubscription?: Subscription;

  constructor(
    @Inject(STUDIES_SERVICE_TOKEN) private readonly service: IStudiesService,
    @Inject(FAVORITES_SERVICE_TOKEN)
    private readonly favoritesService: IFavoritesService
  ) {}

  public ngOnInit(): void {
    this.service
      .getRandomStudies(this.clinicalTrialApiUrl)
      .pipe(this.flattenStudies())
      .subscribe((studiesFlat: StudyFlat[]) => {
        this.studiesSubject.next(studiesFlat);
      });
    this.studiesFlat$ = this.studiesSubject.asObservable();
  }

  public onAddToFavorite(study: StudyFlat, $event: MouseEvent): void {
    this.favoritesService.addFavorite(study);
    this.studiesSubject.next(
      this.studiesSubject.value.map((x) =>
        study.ntcId === x.ntcId ? { ...x, favorite: true } : x)
    );
    $event.stopPropagation();
  }

  public onToggleChange($event: MatSlideToggleChange): void {
    if ($event.checked) {
      this.intervalSubscription = interval(3000)
        .pipe(
          switchMap(() =>
            this.service.getRandomStudies(this.clinicalTrialApiUrl, 1)
          ),
          this.flattenStudies()
        )
        .subscribe((x) => {
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

  private flattenStudies() {
    return (source: Observable<StudiesResponse[]>) =>
      source.pipe(
        map((x: StudiesResponse[]) =>
          x.map((y: StudiesResponse) =>
            y.studies.map((k: Study) => {
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
      );
  }

  public ngOnDestroy(): void {
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
