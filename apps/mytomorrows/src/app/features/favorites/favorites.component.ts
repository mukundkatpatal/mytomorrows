import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { StudyFlat } from '@myt/models';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

  export const data: Array<StudyFlat> = [
  
  ];

@Component({
  selector: 'myt-favorites',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesComponent {
  public displayedColumns: string[] = [
    'NTC ID', 'Completion', 'Overall Status', 'Start Date', 'First Submitted', 'Remove From Favorites'];
  public dataSource = new MatTableDataSource<StudyFlat>(data);

}
