import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { StudyFlat } from '@myt/models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
export class FavoritesComponent {
  public displayedColumns: string[] = [
    'NTC ID', 'Completion', 'Overall Status', 'Start Date', 'First Submitted', 'Remove From Favorites'];
  public dataSource!: MatTableDataSource<StudyFlat>;

  /**
   *
   */
  constructor(@Inject(FAVORITES_SERVICE_TOKEN)private readonly favoritesService: IFavoritesService) {
    
    this.dataSource = new  MatTableDataSource<StudyFlat>(this.favoritesService.favorites);
  }

  public onRemoveFavorite(study: StudyFlat): void {
   this.favoritesService.removeFavorite(study);
   this.dataSource.data = this.favoritesService.favorites;
  }

}
