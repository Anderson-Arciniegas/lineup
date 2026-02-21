import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogsPage } from './catalogs-page';

describe('CatalogsPage', () => {
  let component: CatalogsPage;
  let fixture: ComponentFixture<CatalogsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
