import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  catchError,
  interval,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
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
  FavoritesArrayStoreService,
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
    {
      provide: FAVORITES_SERVICE_TOKEN,
      useExisting: FavoritesArrayStoreService,
    },
    { provide: STUDIES_SERVICE_TOKEN, useClass: ApiClientService },
  ],
})
export class StudiesListComponent implements OnInit, OnDestroy {
  public readonly interval = environment.interval;
  private intervalSubscription: Subscription = new Subscription();
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
    @Inject(STUDIES_SERVICE_TOKEN) private readonly studiesService: IStudiesService,
    @Inject(FAVORITES_SERVICE_TOKEN)
    private readonly favoritesService: IFavoritesService,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.stateSubject.next({ ...this.state, loading: true });
    this.studiesService
      .getRandomStudies(this.clinicalTrialApiUrl)
      .pipe(
        catchError((err) => {
          this.stateSubject.next({
            data: [],
            loading: false,
            error: err || err.message || 'Error fetching studies',
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
    this.stateSubject.pipe(takeUntil(this.destroy$)).subscribe((x) => {
      if (x.error) {
        this.snackBar.open(x.error, 'dismiss', { duration: environment.snackbarDuration });
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
    this.snackBar.open(`Study ${study.ntcId} added to favorites`, 'dismiss', {
      duration: environment.snackbarDuration,
      horizontalPosition: 'left',
      verticalPosition: 'bottom',
    });
    $event.stopPropagation();
  }

  /**
   * When toggle is checked is true, it will start an interval that will fetch a random study every 3 seconds
   * And place it at the beginning of the list. The last study will be removed.
   * @param $event Material slide toggle change event
   */
  public onToggleChange($event: MatSlideToggleChange): void {
    this.intervalSubscription?.unsubscribe(); // unsubscribe if it was already running. (Someone toggled it off and on again)
    if ($event.checked) {
      this.intervalSubscription = interval(environment.interval)
        .pipe(takeUntil(this.destroy$),
          tap(() =>
            this.stateSubject.next({
              ...this.stateSubject.value,
              loading: true,
            })
          ),
          switchMap(() =>
            this.studiesService.getRandomStudies(this.clinicalTrialApiUrl, 1).pipe(
              catchError((err: Error) => {
                this.stateSubject.next({
                  data: [],
                  loading: false,
                  error: err.message || ': Error fetching a random study'
                });
                return of([]);
              })
            )
          ),
          this.flattenStudies()
        )
        .subscribe((x: StudyFlat[]) => {
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
        map((studiesResponses: StudiesResponse[]) =>
          studiesResponses.flatMap((studyResponse: StudiesResponse) =>
            studyResponse.studies.map((studyResponse) => this.transformStudy(studyResponse))
        ),
    ));
  }

  private transformStudy(study: Study): StudyFlat {
    return {
      briefTitle: study.protocolSection.identificationModule.briefTitle,
      ntcId: study.protocolSection.identificationModule.nctId,
      completionDate: study?.protocolSection?.statusModule?.completionDateStruct?.date,
      overallStatus: study.protocolSection.statusModule.overallStatus,
      startDate: study?.protocolSection?.statusModule?.startDateStruct?.date,
      studyFirstSumbmitDate: study?.protocolSection?.statusModule?.studyFirstSubmitDate,
    };
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
