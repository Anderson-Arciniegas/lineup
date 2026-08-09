import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { UserEmailVerificationPublicService } from './user-email-verification-public.service';

describe('UserEmailVerificationPublicService', () => {
  let service: UserEmailVerificationPublicService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      mutate: () => of({ data: {"sendUserVerificationCode":{"success":true},"sendVerificationCode":{"success":true},"verifyCode":{"success":true},"verifyUserVerificationCode":{"success":true}} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [UserEmailVerificationPublicService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(UserEmailVerificationPublicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sendUserVerificationCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.sendUserVerificationCode({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('sendVerificationCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.sendVerificationCode({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('verifyCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.verifyCode({ code: "123" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('verifyUserVerificationCode calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.verifyUserVerificationCode({ code: "123" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
