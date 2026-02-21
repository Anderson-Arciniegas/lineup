import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraggableImageList } from './draggable-image-list';

describe('DraggableImageList', () => {
  let component: DraggableImageList;
  let fixture: ComponentFixture<DraggableImageList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggableImageList],
    }).compileComponents();

    fixture = TestBed.createComponent(DraggableImageList);
    fixture.componentRef.setInput('images', ['url1.jpg', 'url2.jpg']);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit imagesChange when removeImage is called', () => {
    const emitSpy = jest.spyOn(component.imagesChange, 'emit');
    component.removeImage(0);
    expect(emitSpy).toHaveBeenCalledWith(['url2.jpg']);
  });
});
