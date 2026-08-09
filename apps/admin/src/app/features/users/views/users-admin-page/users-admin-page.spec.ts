import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { translateModuleForTests } from '../../../../../testing';
import { UsersAdminService } from '../../../../core/services/users-admin.service';
import { UsersAdminPage } from './users-admin-page';

describe('UsersAdminPage', () => {
  let component: UsersAdminPage;
  let fixture: ComponentFixture<UsersAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersAdminPage, translateModuleForTests()],
      providers: [
        {
          provide: UsersAdminService,
          useValue: {
            findAllUsers: () => of({ items: [{ id: 1 }], total: 1 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load users on init', () => {
    expect(component).toBeTruthy();
    expect(component.items().length).toBe(1);
    expect(component.loadingInitial()).toBe(false);
  });

  it('onScroll triggers loadMore when more data exists', () => {
    component.onScroll();
    expect(component.page()).toBeGreaterThan(1);
  });

  it('sets error when initial load fails', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [UsersAdminPage, translateModuleForTests()],
      providers: [
        {
          provide: UsersAdminService,
          useValue: {
            findAllUsers: () => throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const errorFixture = TestBed.createComponent(UsersAdminPage);
    errorFixture.detectChanges();
    expect(errorFixture.componentInstance.error()).toBe('admin.feature.loadError');
  });
});
