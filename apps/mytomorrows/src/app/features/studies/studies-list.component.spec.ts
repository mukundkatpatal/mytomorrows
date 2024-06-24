
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Subscription, of, throwError } from 'rxjs';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ApiClientService, FavoritesArrayStoreService, IFavoritesService, IStudiesService } from '@myt/services';
import { StudiesResponse, StudyFlat } from '@myt/models';

import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { provideHttpClient } from '@angular/common/http';

import { StudiesListComponent } from './studies-list.component';

describe.only('StudiesListComponent', () => {
  let component: StudiesListComponent;
  let fixture: ComponentFixture<StudiesListComponent>;

  let mockStudiesService: Partial<IStudiesService>;
  let mockFavoritesService: Partial<IFavoritesService>;
  let mockSnackBar: MatSnackBar;

  const mockStudyResponse: StudiesResponse = {
    studies: [
      {
        protocolSection: {
          identificationModule: {
            nctId: "NCT00062673",
            briefTitle: "Study of Duloxetine in Elderly Patients With Major Depressive Disorder"
          },
          statusModule: {
            overallStatus: "COMPLETED",
            startDateStruct: {
              date: new Date("2003-03")
            },
            completionDateStruct: {
              date: new Date("2004-07")
            },
            studyFirstSubmitDate: new Date("2003-06-10")
          }
        }
      }
    ],
    nextPageToken: "NF0g5JGPl_Es"
  };;
  
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
      getRandomStudies: jest.fn().mockReturnValue(of([
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse, 
        mockStudyResponse])),
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
        { provide: FavoritesArrayStoreService, useValue: mockFavoritesService },
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
    component['stateSubject'].subscribe((state) => {
      expect(state.loading).toBe(false);
      expect(state.data).toEqual([mockStudy]);
      expect(state.error).toBe('');
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
    jest.advanceTimersByTime(5000);
    component['state'] = { loading: false, data: [mockStudy, mockStudy ], error: ''}
    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    component['stateSubject'].subscribe((state) => {
      expect(mockStudiesService.getRandomStudies).toHaveBeenCalledWith(component['clinicalTrialApiUrl'], 1);
      expect(component['flattenStudies']).toHaveBeenCalled();
      expect(component['stateSubject'].next).toHaveBeenCalledWith( { loading: false, data: state.data, error: '' });
    });
   done();
   jest.useRealTimers();
  });

  it('should stop interval when toggle is unchecked', () => {
    const mockSubscription = new Subscription();
    component['intervalSubscription'] = mockSubscription;

    // Spy on the unsubscribe method
    const unsubscribeSpy = jest.spyOn(mockSubscription, 'unsubscribe');

    // Simulate the toggle change event with checked set to false
    const toggleChangeEvent = new MatSlideToggleChange(
      {} as any,
      false
    );
    component.onToggleChange(toggleChangeEvent);
    fixture.detectChanges();

    // Assertions
    expect(unsubscribeSpy).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.useRealTimers();
    component.ngOnDestroy();
    fixture.detectChanges();
  });

});
