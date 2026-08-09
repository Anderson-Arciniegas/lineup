import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { firstValueFrom, of } from 'rxjs';
import { createApolloMock } from '../../../testing';
import { BusinessPrivateService } from './business-private.service';

describe('BusinessPrivateService', () => {
  let service: BusinessPrivateService;
  let querySpy: jest.Mock;
  let mutateSpy: jest.Mock;

  beforeEach(() => {
    const apollo = createApolloMock({
      query: () => of({ data: {"myBusiness":{"id":1},"findBusinessByPath":{"id":1},"findAllMyBusinessHours":[]} as Record<string, unknown> }),
      mutate: () => of({ data: {"login":{"business":{"id":1}},"logout":{"status":true},"createBusiness":{"business":{"id":1}},"refreshToken":{"business":{"id":1}},"updateBusiness":{"id":1},"updateBusinessEmail":{"id":1},"changeBusinessPassword":true,"loginWithGoogle":{"business":{"id":1}},"registerWithGoogle":{"business":{"id":1}},"createBusinessHours":[],"updateBusinessHour":{"id":1},"removeBusinessHour":true} as Record<string, unknown> }),
    });
    querySpy = apollo.querySpy;
    mutateSpy = apollo.mutateSpy;
    TestBed.configureTestingModule({
      providers: [BusinessPrivateService, { provide: Apollo, useValue: apollo.mock }],
    });
    service = TestBed.inject(BusinessPrivateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('login calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.login('a@b.com', 'pass'));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('logOut calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.logOut());
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('myBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.myBusiness());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('createBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createBusiness({ name: "Biz" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('refreshToken calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.refreshToken());
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateBusiness calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateBusiness({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateBusinessEmail calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateBusinessEmail({ email: "a@b.com" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('getBusinessByPath calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.getBusinessByPath('biz'));
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('changeBusinessPassword calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.changeBusinessPassword({ password: "a" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('loginWithGoogle calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.loginWithGoogle({ token: "t" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('registerWithGoogle calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.registerWithGoogle({ token: "t" } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('createBusinessHours calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.createBusinessHours({ hours: [] } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('updateBusinessHour calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.updateBusinessHour({ id: 1 } as never));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });

  it('findAllMyBusinessHours calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.findAllMyBusinessHours());
    expect(result).toBeDefined();
    expect(querySpy).toHaveBeenCalled();
  });

  it('removeBusinessHour calls Apollo and returns data', async () => {
    const result = await firstValueFrom(service.removeBusinessHour(1));
    expect(result).toBeDefined();
    expect(mutateSpy).toHaveBeenCalled();
  });
});
