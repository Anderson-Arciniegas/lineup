import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SEO_SITE_ORIGIN } from '@lineup/core';
import { of, throwError } from 'rxjs';
import { translateModuleForTests } from '../../../../../testing';
import { BusinessAdminService } from '../../../../core/services/business-admin.service';
import { BusinessesAdminPage } from './businesses-admin-page';

describe('BusinessesAdminPage', () => {
  let component: BusinessesAdminPage;
  let fixture: ComponentFixture<BusinessesAdminPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessesAdminPage, translateModuleForTests()],
      providers: [
        { provide: SEO_SITE_ORIGIN, useValue: 'https://lineup.test' },
        {
          provide: BusinessAdminService,
          useValue: {
            findAllBusinesses: () =>
              of({ items: [{ id: 1, path: 'my-shop' }], total: 1 }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessesAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load businesses on init', () => {
    expect(component).toBeTruthy();
    expect(component.items().length).toBe(1);
  });

  it('lineupPublicUrl builds encoded public URL', () => {
    const url = component.lineupPublicUrl({ path: 'my-shop' } as never);
    expect(url).toBe('https://lineup.test/my-shop');
  });

  it('lineupPublicUrl returns null without path', () => {
    expect(component.lineupPublicUrl({ path: '' } as never)).toBeNull();
  });

  it('sets error when initial load fails', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BusinessesAdminPage, translateModuleForTests()],
      providers: [
        { provide: SEO_SITE_ORIGIN, useValue: 'https://lineup.test' },
        {
          provide: BusinessAdminService,
          useValue: {
            findAllBusinesses: () => throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const errorFixture = TestBed.createComponent(BusinessesAdminPage);
    errorFixture.detectChanges();
    expect(errorFixture.componentInstance.error()).toBe('admin.feature.loadError');
  });
});
