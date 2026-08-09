import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessPublicService } from '@lineup/core';
import { TranslateModule } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { of, throwError } from 'rxjs';
import { createApolloMock } from '../../../../../testing';
import { FavoritesPage } from './favorites-page';

describe('FavoritesPage', () => {
  let component: FavoritesPage;
  let fixture: ComponentFixture<FavoritesPage>;
  let findFollowedBusinesses: jest.Mock;

  beforeEach(async () => {
    findFollowedBusinesses = jest.fn(() =>
      of({
        items: [{ id: 1, path: 'b1', name: 'B1' }],
        page: 1,
        limit: 20,
        total: 1,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [FavoritesPage, TranslateModule.forRoot()],
      providers: [
        { provide: Apollo, useValue: createApolloMock().mock },
        {
          provide: BusinessPublicService,
          useValue: { findFollowedBusinesses },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesPage);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('debe crear y cargar favoritos', () => {
    expect(component).toBeTruthy();
    expect(findFollowedBusinesses).toHaveBeenCalled();
    expect(component.businesses.length).toBe(1);
    expect(component.page).toBe(2);
  });

  it('onScroll debe pedir la siguiente página', () => {
    component.onScroll();
    expect(findFollowedBusinesses).toHaveBeenCalledTimes(2);
  });

  it('no debe cargar si noMoreResults', () => {
    component.noMoreResults = true;
    component.getFavoritesBusinesses();
    expect(findFollowedBusinesses).toHaveBeenCalledTimes(1);
  });

  it('debe marcar fin de lista con página vacía', () => {
    findFollowedBusinesses.mockReturnValueOnce(
      of({ items: [], page: 2, limit: 20, total: 1 }),
    );
    component.getFavoritesBusinesses();
    expect(component.noMoreResults).toBe(true);
  });
});

describe('FavoritesPage errores', () => {
  it('debe manejar error de API', async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesPage, TranslateModule.forRoot()],
      providers: [
        { provide: Apollo, useValue: createApolloMock().mock },
        {
          provide: BusinessPublicService,
          useValue: {
            findFollowedBusinesses: () =>
              throwError(() => new Error('fail')),
          },
        },
      ],
    }).compileComponents();
    const fix = TestBed.createComponent(FavoritesPage);
    fix.componentInstance.getFavoritesBusinesses();
    expect(fix.componentInstance.attempt).toBe(false);
  });
});
