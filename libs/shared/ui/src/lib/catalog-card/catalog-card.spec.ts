import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogCard } from './catalog-card';

describe('CatalogCard', () => {
  let component: CatalogCard;
  let fixture: ComponentFixture<CatalogCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogCard],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
