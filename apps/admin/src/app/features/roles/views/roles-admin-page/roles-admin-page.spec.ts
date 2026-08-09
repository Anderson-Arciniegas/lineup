import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { translateModuleForTests } from '../../../../../testing';
import { RolesAdminService } from '../../../../core/services/roles-admin.service';
import { RolesAdminPage } from './roles-admin-page';

describe('RolesAdminPage', () => {
  let fixture: ComponentFixture<RolesAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolesAdminPage, translateModuleForTests()],
      providers: [
        {
          provide: RolesAdminService,
          useValue: { getAllRoles: () => of([{ id: 1, name: 'Admin' }]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RolesAdminPage);
    fixture.detectChanges();
  });

  it('should create and load roles', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component.roles().length).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('sets error when loading roles fails', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RolesAdminPage, translateModuleForTests()],
      providers: [
        {
          provide: RolesAdminService,
          useValue: {
            getAllRoles: () => throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const errorFixture = TestBed.createComponent(RolesAdminPage);
    errorFixture.detectChanges();
    expect(errorFixture.componentInstance.error()).toBe('admin.feature.loadError');
  });
});
