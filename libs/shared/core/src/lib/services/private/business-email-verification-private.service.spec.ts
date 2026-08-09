import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { BusinessEmailVerificationPrivateService } from './business-email-verification-private.service';

describe('BusinessEmailVerificationPrivateService', () => {
  let service: BusinessEmailVerificationPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      mutate: () => of({ data: {"sendBusinessVerificationCode":{"success":true},"sendVerificationCode":{"success":true},"verifyBusinessVerificationCode":{"success":true},"verifyCode":{"success":true}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [BusinessEmailVerificationPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(BusinessEmailVerificationPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sendBusinessVerificationCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.sendBusinessVerificationCode({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('sendVerificationCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.sendVerificationCode({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('verifyBusinessVerificationCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.verifyBusinessVerificationCode({ code: "123" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('verifyCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.verifyCode({ code: "123" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
