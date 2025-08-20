import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ControlPanelNav } from './control-panel-nav';

describe('ControlPanelNav', () => {
  let component: ControlPanelNav;
  let fixture: ComponentFixture<ControlPanelNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPanelNav, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
