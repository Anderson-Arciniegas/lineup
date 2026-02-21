import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCatalogPage } from './create-catalog-page';

describe('CreateCatalogPage', () => {
  let component: CreateCatalogPage;
  let fixture: ComponentFixture<CreateCatalogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCatalogPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCatalogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
