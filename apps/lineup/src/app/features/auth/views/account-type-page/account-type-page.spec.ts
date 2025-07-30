import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { AccountTypePage } from './account-type-page';

describe('AccountTypePage', () => {
  let component: AccountTypePage;
  let fixture: ComponentFixture<AccountTypePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTypePage, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTypePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
