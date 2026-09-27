import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { translateModuleForTests } from '../../../../../testing';
import { UsersAdminService } from '../../../../core/services/users-admin.service';
import { UsersAdminPage } from './users-admin-page';

describe('UsersAdminPage (HU-26)', () => {
  let component: UsersAdminPage;
  let fixture: ComponentFixture<UsersAdminPage>;
  let findAllUsers: jest.Mock;

  beforeEach(async () => {
    findAllUsers = jest.fn(() => of({ items: [{ id: 1 }], total: 1 }));
    await TestBed.configureTestingModule({
      imports: [UsersAdminPage, translateModuleForTests()],
      providers: [
        {
          provide: UsersAdminService,
          useValue: { findAllUsers },
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
    expect(findAllUsers).toHaveBeenCalledTimes(1);
  });

  it('marca el listado como completo cuando ya no hay más páginas', () => {
    expect(component.noMore()).toBe(true);
    component.onScroll();
    expect(findAllUsers).toHaveBeenCalledTimes(1);
  });

  it('onScroll triggers loadMore when more data exists', async () => {
    TestBed.resetTestingModule();
    findAllUsers = jest.fn(() => of({ items: [{ id: 1 }], total: 40 }));
    await TestBed.configureTestingModule({
      imports: [UsersAdminPage, translateModuleForTests()],
      providers: [
        {
          provide: UsersAdminService,
          useValue: { findAllUsers },
        },
      ],
    }).compileComponents();
    const moreFixture = TestBed.createComponent(UsersAdminPage);
    moreFixture.detectChanges();
    moreFixture.componentInstance.onScroll();
    expect(findAllUsers).toHaveBeenCalledTimes(2);
    expect(moreFixture.componentInstance.page()).toBeGreaterThan(2);
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
