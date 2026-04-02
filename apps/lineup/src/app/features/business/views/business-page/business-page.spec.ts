import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { Apollo } from 'apollo-angular';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { BusinessPage } from './business-page';

describe('BusinessPage', () => {
  let component: BusinessPage;
  let fixture: ComponentFixture<BusinessPage>;

  const mockApolloClient = {
    query: () => of({ data: { findBusinessByPath: null } }),
    mutate: () => of({ data: {} }),
  };

  const mockApollo = {
    use: () => mockApolloClient,
  } as unknown as Apollo;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BusinessPage, TranslateModule.forRoot(),],
            providers: [{
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            params: { business: 'test-business' }
                        }
                    }
                },
                { provide: Apollo, useValue: mockApollo },
                DialogService,
                {
                  provide: MessageService,
                  useValue: { add: jest.fn() },
                },
                TranslateService,
                TranslateStore,
            ],
    }).compileComponents();

    fixture = TestBed.createComponent(BusinessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  
  
});
