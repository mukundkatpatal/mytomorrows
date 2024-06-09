import { TestBed } from '@angular/core/testing';
import { FavoritesServiceArrayStore } from './favorites.service';
import { StudyFlat } from '@myt/models';

describe('FavoritesServiceArrayStore', () => {
  let service: FavoritesServiceArrayStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FavoritesServiceArrayStore],
    });
    service = TestBed.inject(FavoritesServiceArrayStore);
  });

  it('should add a favorite study', () => {
    const study: StudyFlat = {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678574',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
    };
    service.addFavorite(study);

    service.favorites$.subscribe((favorites) => {
      expect(favorites.length).toBe(1);
      expect(favorites[0].ntcId).toBe('NCT00678574');
      expect(favorites[0].favorite).toBeTruthy();
    });
  });

  it('should not add a duplicate favorite study', () => {
    const study: StudyFlat = {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678574',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
    };
    service.addFavorite(study);
    service.addFavorite(study);
    service.favorites$.subscribe((favorites) => {
      expect(favorites.length).toBe(1);
    });
  });

  it('should not add a favorite study if max count is exceeded', () => {
    const maxCount = 3;
    const study: StudyFlat = {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678574',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
    };
    const studies: StudyFlat[] = [ study, study, study, study, study ];

    studies.forEach((study) => service.addFavorite(study, maxCount));
    
    
    service.favorites$.subscribe((favorites) => {
      expect(favorites.length).toBe(3);
    });
  });

  it('should remove a favorite study', () => {
    const study: StudyFlat = {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678574',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
    };
    service.addFavorite(study);
    service.removeFavorite(study);

    service.favorites$.subscribe((favorites) => {
      expect(favorites.length).toBe(0);
    });
  });

  it('should not remove a study that is not in the favorites list', () => {
    const study1: StudyFlat = {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00678574',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
    };
    const study2: StudyFlat = {
      briefTitle:
        'The Role of GABA and Neurosteroids in Premenstrual Dysphoric Disorder',
      completionDate: new Date('2008-12'),
      ntcId: 'NCT00123456',
      overallStatus: 'COMPLETED',
      startDate: new Date('1998-03'),
      studyFirstSumbmitDate: new Date('2008-05-13'),
    };
    service.addFavorite(study1);
    service.removeFavorite(study2);

    service.favorites$.subscribe((favorites) => {
      expect(favorites.length).toBe(1);
      expect(favorites[0].ntcId).toBe('NCT00678574');
    });
  });
});
