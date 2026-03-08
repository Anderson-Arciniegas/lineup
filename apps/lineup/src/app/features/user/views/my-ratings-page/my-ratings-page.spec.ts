import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyRatingsPage } from './my-ratings-page';

describe('MyRatingsPage', () => {
  let component: MyRatingsPage;
  let fixture: ComponentFixture<MyRatingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyRatingsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(MyRatingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
