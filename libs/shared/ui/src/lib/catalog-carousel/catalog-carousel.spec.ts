import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogCarousel } from './catalog-carousel';

describe('CatalogCarousel', () => {
  let component: CatalogCarousel;
  let fixture: ComponentFixture<CatalogCarousel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCarousel],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCarousel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
