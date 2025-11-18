import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserSettingsPage } from './user-settings-page';

describe('UserSettingsPage', () => {
  let component: UserSettingsPage;
  let fixture: ComponentFixture<UserSettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserSettingsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(UserSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
