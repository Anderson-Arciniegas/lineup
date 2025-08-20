import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlPanelPage } from './control-panel-page';

describe('ControlPanelPage', () => {
  let component: ControlPanelPage;
  let fixture: ComponentFixture<ControlPanelPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPanelPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
