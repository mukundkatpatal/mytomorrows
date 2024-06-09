
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StudiesListComponent } from './studies-list.component';
import { ApiClientService, FAVORITES_SERVICE_TOKEN, FavoritesServiceArrayStore, IFavoritesService, IStudiesService, STUDIES_SERVICE_TOKEN } from '@myt/services';
import { StudyFlat } from '@myt/models';
import { MatSlideToggle, MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideHttpClient } from '@angular/common/http';

describe.only('StudiesListComponent', () => {
  let component: StudiesListComponent;
  let fixture: ComponentFixture<StudiesListComponent>;

  let mockStudiesService: Partial<IStudiesService>;
  let mockFavoritesService: Partial<IFavoritesService>;
  let mockSnackBar: MatSnackBar;

  const mockStudy: StudyFlat = {
    briefTitle: 'Study 1',
    completionDate: new Date('2008-12'),
    ntcId: 'NCT00678574',
    overallStatus: 'COMPLETED',
    startDate: new Date('1998-03'),
    studyFirstSumbmitDate: new Date('2008-05-13'),
  };

  beforeEach(async () => {

    mockStudiesService = {
      getRandomStudies: jest.fn().mockReturnValue(of([mockStudy])),
    };
  
    mockFavoritesService = {
      addFavorite: jest.fn(),
    };
  
    mockSnackBar = {
    open: jest.fn(),
    } as Partial<MatSnackBar> as MatSnackBar;

    await TestBed.configureTestingModule({
      imports: [
        StudiesListComponent,
        MatSnackBarModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        MatSlideToggleModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatExpansionModule,
        MatToolbarModule,
        MatProgressBarModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ApiClientService, useValue: mockStudiesService },
        { provide: FavoritesServiceArrayStore, useValue: mockFavoritesService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update state and show snackbar on error', () => {
    const errorMessage = 'Error fetching studies';
    jest.spyOn(mockStudiesService, 'getRandomStudies').mockReturnValue(throwError(errorMessage));
    component['stateSubject'].subscribe(() => {
        component.ngOnInit();
        fixture.detectChanges();
        expect(component['stateSubject'].value.loading).toBe(false);
        expect(component['stateSubject'].value.error).toBe(errorMessage);
        expect(mockSnackBar.open).toHaveBeenCalledWith(errorMessage, 'dismiss', { duration: 3000 });
    });
  });

  it('should update state with studies data on success', () => {
    component.ngOnInit();
    fixture.detectChanges();
    component['stateSubject'].subscribe(() => {
        expect(component['stateSubject'].value.loading).toBe(false);
        expect(component['stateSubject'].value.data).toEqual([mockStudy]);
        expect(component['stateSubject'].value.error).toBe('');
    });
  });

  it('should add a study to favorites and update state', () => {
    component.onAddToFavorite(mockStudy, new MouseEvent('click'));
    fixture.detectChanges();

    expect(mockFavoritesService.addFavorite).toHaveBeenCalledWith(mockStudy);
    component['stateSubject'].subscribe(() => {
        expect(component['stateSubject'].value.data[0].favorite).toBe(true);
        expect(mockSnackBar.open).toHaveBeenCalledWith(`Study ${mockStudy.ntcId} added to favorites`, 'dismiss', {
          duration: 3000,
          horizontalPosition: 'left',
          verticalPosition: 'bottom',
        });
    });
  });

  it('should start interval and fetch studies when toggle is checked', (done) => {
    jest.useFakeTimers();
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const toggleEvent = { checked: true } as any;

    component.onToggleChange(toggleEvent);
    fixture.detectChanges();
    jest.advanceTimersByTime(3000);

    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 3000);
    expect(mockStudiesService.getRandomStudies).toHaveBeenCalled();
    
    jest.useRealTimers();
    done();
  });

});
