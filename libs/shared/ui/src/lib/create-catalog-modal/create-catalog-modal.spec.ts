import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateCatalogModal } from './create-catalog-modal';

describe('CreateCatalogModal', () => {
  let component: CreateCatalogModal;
  let fixture: ComponentFixture<CreateCatalogModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCatalogModal],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateCatalogModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
