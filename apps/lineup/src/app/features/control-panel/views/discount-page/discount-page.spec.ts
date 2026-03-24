import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountPage } from './discount-page';

describe('DiscountPage', () => {
  let component: DiscountPage;
  let fixture: ComponentFixture<DiscountPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
