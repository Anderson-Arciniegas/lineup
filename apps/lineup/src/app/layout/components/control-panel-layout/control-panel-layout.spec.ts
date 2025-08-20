import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateService, TranslateStore } from '@ngx-translate/core';
import { ControlPanelLayout } from './control-panel-layout';

describe('ControlPanelLayout', () => {
  let component: ControlPanelLayout;
  let fixture: ComponentFixture<ControlPanelLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPanelLayout, RouterModule.forRoot([])], 
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
