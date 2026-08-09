import { TestBed } from '@angular/core/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'crypto', {
      value: require('crypto').webcrypto,
      configurable: true,
    });
    TestBed.configureTestingModule({
      providers: [EncryptionService],
    });
    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('encrypt and decrypt roundtrip', async () => {
    const plain = 'hello lineup';
    const secret = 'test-secret-key';
    const encrypted = await service.encrypt(plain, secret);
    expect(encrypted).not.toBe(plain);
    const decrypted = await service.decrypt(encrypted, secret);
    expect(decrypted).toBe(plain);
  });
});
