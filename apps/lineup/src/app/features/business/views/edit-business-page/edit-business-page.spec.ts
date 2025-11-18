import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditBusinessPage } from './edit-business-page';

describe('EditBusinessPage', () => {
  let component: EditBusinessPage;
  let fixture: ComponentFixture<EditBusinessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBusinessPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EditBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
