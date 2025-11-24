import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ImageCropper } from './image-cropper';

describe('ImageCropper', () => {
  let component: ImageCropper;
  let fixture: ComponentFixture<ImageCropper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCropper, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        TranslateService,
        TranslateStore
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageCropper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
