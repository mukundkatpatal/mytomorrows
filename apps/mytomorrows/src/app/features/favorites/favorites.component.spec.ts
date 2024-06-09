import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FavoritesComponent } from './favorites.component';
import { FavoritesServiceArrayStore, IFavoritesService } from '@myt/services';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StudyFlat } from '@myt/models';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {MatTableHarness} from '@angular/material/table/testing';
import { HarnessLoader } from '@angular/cdk/testing';

describe('FavoritesComponent', () => {
  let component: FavoritesComponent;
  let fixture: ComponentFixture<FavoritesComponent>;
  let mockFavoritesService: IFavoritesService;
  let mockSnackBar: MatSnackBar;
  let loader: HarnessLoader;
  const mockData: StudyFlat[] = [
    {
      briefTitle:
      'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678574',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13')
    },
    {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678575',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
     },
  ];
  beforeEach(async () => {
    mockFavoritesService = {
      get favorites$() { return of(mockData) },
      removeFavorite: jest.fn(),
      addFavorite: jest.fn(),
    };
    mockSnackBar = {
      open: jest.fn(),
    } as Partial<MatSnackBar> as MatSnackBar;

    await TestBed.configureTestingModule({
      imports: [MatTableModule, MatButtonModule, MatIconModule, MatSnackBarModule, FavoritesComponent],
      providers: [
        {
          provide: FavoritesServiceArrayStore,
          useValue: mockFavoritesService
        },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  it('should initialize dataSource with data from the favoritesService', () => {

    component.favoritesService.favorites$.subscribe(x =>
      expect(component.dataSource.data.length).toEqual(x.length));
  });

  it('should display the correct number of rows', async () => {

    const table = await loader.getHarness(MatTableHarness);
    const rows = await table.getRows();
    expect(rows.length).toBe(2);
  });

  it('should call removeFavorite and show a snack bar when onRemoveFavorite is called', () => {
    const study = mockData[0];
    component.onRemoveFavorite(study);
    expect(component.favoritesService.removeFavorite).toHaveBeenCalledWith(study);
    expect(mockSnackBar.open).toHaveBeenCalledWith(`Study ${study.ntcId} removed from favorites`, 'dismiss', { duration: 3000, horizontalPosition: 'left', verticalPosition: 'bottom' });
  });

  it('should display "No favorites available" message when dataSource is empty', () => {
    jest.spyOn(mockFavoritesService, "favorites$", "get").mockReturnValue(of([]));
    component.favoritesService.favorites$.subscribe(()=> {
      component.ngOnInit();
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css('[data-test="no-data-found"]')).nativeElement;
      expect(element.textContent).toEqual('No favorites available');
    });
  });
});