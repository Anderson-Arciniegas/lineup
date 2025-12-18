import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { EditBusinessPage } from './edit-business-page';

describe('EditBusinessPage', () => {
  let component: EditBusinessPage;
  let fixture: ComponentFixture<EditBusinessPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBusinessPage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditBusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
