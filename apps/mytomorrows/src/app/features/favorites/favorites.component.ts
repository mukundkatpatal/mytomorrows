import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { StudyFlat } from '@myt/models';
import {
  FAVORITES_SERVICE_TOKEN,
  FavoritesArrayStoreService,
  IFavoritesService,
} from '@myt/services';
import { environment } from '../../app.config';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'myt-favorites',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: FAVORITES_SERVICE_TOKEN,
      useExisting: FavoritesArrayStoreService,
    },
  ],
})
export class FavoritesComponent implements OnInit, OnDestroy {
  public displayedColumns: string[] = [
    'NTC ID',
    'Completion',
    'Overall Status',
    'Start Date',
    'First Submitted',
    'Remove From Favorites',
  ];
  public dataSource = new MatTableDataSource<StudyFlat>();
  private destroy$ = new Subject<void>();
  constructor(
    @Inject(FAVORITES_SERVICE_TOKEN)
    private readonly favoritesService: IFavoritesService,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe((studies: StudyFlat[]) => (this.dataSource.data = studies));
  }

  public onRemove(study: StudyFlat): void {
    this.favoritesService.removeFavorite(study);
    this.snackBar.open(
      `Study ${study.ntcId} has been removed from the favorites`,
      'dismiss',
      {
        duration: environment.snackbarDuration,
        horizontalPosition: 'left',
        verticalPosition: 'bottom',
      }
    );
  }
  /**
  * This can be a in a base class
  */
  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
