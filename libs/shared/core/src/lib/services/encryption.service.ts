import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  private readonly algorithm = 'AES-CBC';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 16;
  private readonly iterations = 100000; // Web Crypto API usa más iteraciones por defecto

  /**
   * Convierte un string a Uint8Array
   */
  private stringToUint8Array(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  /**
   * Convierte un Uint8Array a string
   */
  private uint8ArrayToString(arr: Uint8Array): string {
    const decoder = new TextDecoder();
    return decoder.decode(arr);
  }

  /**
   * Genera bytes aleatorios usando Web Crypto API
   */
  private getRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Convierte un string base64 a Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Convierte un Uint8Array a string base64
   */
  private uint8ArrayToBase64(arr: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
    return btoa(binary);
  }

  /**
   * Deriva una clave usando PBKDF2
   */
  private async deriveKey(
    password: string,
    salt: Uint8Array,
  ): Promise<CryptoKey> {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      this.stringToUint8Array(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey'],
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: 'SHA-256',
      },
      passwordKey,
      {
        name: this.algorithm,
        length: 256,
      },
      false,
      ['encrypt', 'decrypt'],
    );
  }

  /**
   * Encripta un valor usando AES-256-CBC
   */
  async encrypt(value: string, secretKey: string): Promise<string> {
    // Generar salt aleatorio
    const salt = this.getRandomBytes(this.saltLength);

    // Derivar clave usando PBKDF2
    const key = await this.deriveKey(secretKey, salt);

    // Generar IV aleatorio
    const iv = this.getRandomBytes(this.ivLength);

    // Encriptar
    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      this.stringToUint8Array(value),
    );

    // Combinar salt, IV y texto cifrado: salt:iv:encrypted
    const saltArray = new Uint8Array(salt);
    const ivArray = new Uint8Array(iv);
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(
      saltArray.length + ivArray.length + encryptedArray.length,
    );
    result.set(saltArray, 0);
    result.set(ivArray, saltArray.length);
    result.set(encryptedArray, saltArray.length + ivArray.length);

    return this.uint8ArrayToBase64(result);
  }

  /**
   * Desencripta un valor usando AES-256-CBC
   */
  async decrypt(encrypted: string, secretKey: string): Promise<string> {
    // Decodificar desde base64
    const data = this.base64ToUint8Array(encrypted);

    // Extraer salt, IV y texto cifrado
    const salt = data.slice(0, this.saltLength);
    const iv = data.slice(this.saltLength, this.saltLength + this.ivLength);
    const encryptedData = data.slice(this.saltLength + this.ivLength);

    // Derivar clave usando PBKDF2 (mismo salt y parámetros)
    const key = await this.deriveKey(secretKey, salt);

    // Desencriptar
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv,
      },
      key,
      encryptedData,
    );

    return this.uint8ArrayToString(new Uint8Array(decrypted));
  }
}
