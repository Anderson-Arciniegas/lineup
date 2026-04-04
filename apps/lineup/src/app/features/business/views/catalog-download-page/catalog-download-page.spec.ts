import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogDownloadPage } from './catalog-download-page';

describe('CatalogDownloadPage', () => {
  let component: CatalogDownloadPage;
  let fixture: ComponentFixture<CatalogDownloadPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogDownloadPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogDownloadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
