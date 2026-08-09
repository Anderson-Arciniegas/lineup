import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { translateModuleForTests } from '../../../../testing';
import { TopNavAdmin } from './top-nav-admin';

describe('TopNavAdmin', () => {
  let component: TopNavAdmin;
  let fixture: ComponentFixture<TopNavAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavAdmin, translateModuleForTests()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TopNavAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emitSidebarToggle emits sidebarToggle event', () => {
    const spy = jest.fn();
    component.sidebarToggle.subscribe(spy);
    component.emitSidebarToggle();
    expect(spy).toHaveBeenCalled();
  });
});
