import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudiesListComponent } from './studies-list.component';

describe('StudiesListComponent', () => {
  let component: StudiesListComponent;
  let fixture: ComponentFixture<StudiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudiesListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StudiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
