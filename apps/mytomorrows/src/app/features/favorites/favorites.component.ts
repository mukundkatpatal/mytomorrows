import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { StudyFlat } from '@myt/models';
import { FAVORITES_SERVICE_TOKEN, FavoritesServiceArrayStore, IFavoritesService } from '@myt/services';

@Component({
  selector: 'myt-favorites',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{provide: FAVORITES_SERVICE_TOKEN, useExisting: FavoritesServiceArrayStore}]
})
export class FavoritesComponent implements OnInit {
  public displayedColumns: string[] = [
    'NTC ID', 'Completion', 'Overall Status', 'Start Date', 'First Submitted', 'Remove From Favorites'];
  public dataSource!: MatTableDataSource<StudyFlat>;

  constructor(@Inject(FAVORITES_SERVICE_TOKEN) public readonly favoritesService: IFavoritesService, private _snackBar: MatSnackBar) {
  }

  public ngOnInit(): void {
    this.dataSource = new  MatTableDataSource<StudyFlat>();
    this.favoritesService.favorites$.subscribe(x => this.dataSource.data = x);  
  }

  public onRemoveFavorite(study: StudyFlat): void {
   this.favoritesService.removeFavorite(study);
   this._snackBar.open(`Study ${study.ntcId} removed from favorites`, 'dismiss', { duration: 3000, horizontalPosition: 'left', verticalPosition: 'bottom' });
  }

}
