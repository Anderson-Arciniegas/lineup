import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogPanelPage } from './catalog-panel-page';

describe('CatalogPanelPage', () => {
  let component: CatalogPanelPage;
  let fixture: ComponentFixture<CatalogPanelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPanelPage],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
