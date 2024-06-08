import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ApiClientService, IStudiesService, STUDIES_SERVICE_TOKEN } from './apiclient.service';
import { provideHttpClient } from '@angular/common/http';

import * as dateutils from './dates.utils'
import { StudiesResponse } from '@myt/models';

describe('ApiclientService', () => {
  let service: IStudiesService;

  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: STUDIES_SERVICE_TOKEN, useClass: ApiClientService },
          provideHttpClient(),
          provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(STUDIES_SERVICE_TOKEN);
    httpTestingController = TestBed.inject(HttpTestingController);

  });
  afterEach(() => {
    httpTestingController.verify();
  });
  it('should be created', () => {
    jest.spyOn(dateutils, 'generateDateRanges').mockReturnValue([
      ['2022-01-01', '2022-01-31'],
      ['2022-02-01', '2022-03-03']
    ]);

    const mockResponse: StudiesResponse = { studies:[{
      protocolSection:{ 
        identificationModule:{
          nctId:"NCT00882882",
          briefTitle:"To Demonstrate the Relative Bioavailability of Metformin HCL 500 mg Extended Release (XR) Tablets Under Fasting Conditions"},
          statusModule:{
            overallStatus:"COMPLETED",
            startDateStruct:{
              date: new Date("2001-06")
            },
            completionDateStruct:{
            date: new Date("2001-06")
          },
            studyFirstSubmitDate:new Date("2009-04-16")
          }
        }
      }],
      nextPageToken:"NF0g5JGEkg" 
    };

    service.getRandomStudies('apiUrl').subscribe(responses => {
      expect(responses.length).toBe(2);
      expect(responses[0]).toEqual(mockResponse);
    });

    const req1 = httpTestingController.expectOne('apiUrl&filter.advanced=AREA[StudyFirstSubmitDate]RANGE[2022-01-01,2022-01-31]');
    const req2 = httpTestingController.expectOne('apiUrl&filter.advanced=AREA[StudyFirstSubmitDate]RANGE[2022-02-01,2022-03-03]');

    req1.flush(mockResponse);
    req2.flush(mockResponse);

    expect(service).toBeTruthy();
  });
});
