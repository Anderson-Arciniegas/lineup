import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    fixture.detectChanges();
  });

  it('should create root component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes mobile title', () => {
    expect(fixture.componentInstance['title']).toBe('mobile');
  });
});
