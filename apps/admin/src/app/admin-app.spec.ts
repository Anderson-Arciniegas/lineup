import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminApp } from './admin-app';
import { appRoutes } from './app.routes';

describe('AdminApp', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminApp],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminApp);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
