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
  Subject,
  Subscription,
  catchError,
  from,
  interval,
  map,
  mergeMap,
  of,
  switchMap,
  takeUntil,
  tap,
  toArray,
} from 'rxjs';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {
  MatSlideToggleChange,
  MatSlideToggleModule,
} from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { StudiesResponse, Study, StudyFlat, StudyListState } from '@myt/models';
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
    MatIconModule,
    MatProgressBarModule,
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
  private intervalSubscription?: Subscription;
  private readonly destroy$ = new Subject<void>();

  private state: StudyListState = {
    loading: false,
    data: [],
    error: '',
  };
  private readonly stateSubject = new BehaviorSubject<StudyListState>(
    this.state
  );
  public studiesListState$ = this.stateSubject.asObservable();

  constructor(
    @Inject(STUDIES_SERVICE_TOKEN) private readonly service: IStudiesService,
    @Inject(FAVORITES_SERVICE_TOKEN)
    private readonly favoritesService: IFavoritesService,
    private _snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.stateSubject.next({ ...this.state, loading: true });
    this.service
      .getRandomStudies(this.clinicalTrialApiUrl)
      .pipe(
        catchError((err) => {
          this.stateSubject.next({
            data: [],
            loading: false,
            error: err || '',
          });
          return of([]);
        }),
        this.flattenStudies(),
        takeUntil(this.destroy$)
      )
      .subscribe((studiesFlat: StudyFlat[]) => {
        this.stateSubject.next({
          data: studiesFlat,
          loading: false,
          error: '',
        });
      });
    this.stateSubject.subscribe((x) => {
      if (x.error) {
        this._snackBar.open(x.error, 'dismiss', { duration: 3000 });
      }
    });
  }

  public onAddToFavorite(study: StudyFlat, $event: MouseEvent): void {
    this.favoritesService.addFavorite(study);
    this.stateSubject.next({
      ...this.stateSubject.value,
      data: this.stateSubject.value.data.map((x) =>
        study.ntcId === x.ntcId ? { ...x, favorite: true } : x
      ),
    });
    this._snackBar.open(`Study ${study.ntcId} added to favorites`, 'dismiss', {
      duration: 3000,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
    });
    $event.stopPropagation();
  }

  public onToggleChange($event: MatSlideToggleChange): void {
    if ($event.checked) {
      this.intervalSubscription = interval(3000)
        .pipe(
          tap(() =>
            this.stateSubject.next({
              ...this.stateSubject.value,
              loading: true,
            })
          ),
          switchMap(() =>
            this.service.getRandomStudies(this.clinicalTrialApiUrl, 1)
          ),
          this.flattenStudies()
        )
        .subscribe((x) => {
          const currentvalues = this.stateSubject.value.data;
          if (currentvalues.length > 1) {
            currentvalues.pop();
            currentvalues.unshift(x[0]);
            this.stateSubject.next({
              ...this.stateSubject.value,
              data: currentvalues,
              loading: false,
            });
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
    this.destroy$?.next();
    this.destroy$?.complete();
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
