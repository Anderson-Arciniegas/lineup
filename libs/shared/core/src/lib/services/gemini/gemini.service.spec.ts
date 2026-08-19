import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { GeminiService } from './gemini.service';

const generateContent = jest.fn();

jest.mock('@google/genai/web', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent },
  })),
}));

jest.mock('@lineup/envs', () => ({
  environment: {
    google: {
      GEMINI_API_KEY: 'test-gemini-key',
      GEMINI_MODEL: 'gemini-2.5-flash',
    },
  },
}));

describe('GeminiService', () => {
  let service: GeminiService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    generateContent.mockReset();
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    TestBed.configureTestingModule({
      providers: [GeminiService],
    });
    service = TestBed.inject(GeminiService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('rejects when title is empty', async () => {
    await expect(
      firstValueFrom(
        service.generateProductDescription({
          title: '  ',
          imageUrls: [],
        }),
      ),
    ).rejects.toThrow('TITLE_REQUIRED');
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('generates description from title and images', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => blob,
    });

    generateContent.mockResolvedValue({
      text: '<p>Descripción de venta</p>',
    });

    const result = await firstValueFrom(
      service.generateProductDescription({
        title: 'Zapatillas Runner',
        subtitle: 'Edición ligera',
        imageUrls: ['https://cdn.example/img.png'],
        userPrompt: 'Enfatiza comodidad',
      }),
    );

    expect(result).toBe('<p>Descripción de venta</p>');
    expect(fetchMock).toHaveBeenCalledWith('https://cdn.example/img.png');
    expect(generateContent).toHaveBeenCalledTimes(1);
    const callArg = generateContent.mock.calls[0][0];
    expect(callArg.model).toBe('gemini-2.5-flash');
    expect(callArg.config.systemInstruction).toContain('sales description');
    expect(callArg.contents.length).toBe(2);
    expect(callArg.contents[0].inlineData.mimeType).toBe('image/png');
    expect(callArg.contents[1]).toContain('Zapatillas Runner');
    expect(callArg.contents[1]).toContain('Edición ligera');
    expect(callArg.contents[1]).toContain('Enfatiza comodidad');
  });

  it('continues when image fetch fails and includes URL in text prompt', async () => {
    fetchMock.mockRejectedValue(new Error('CORS'));
    generateContent.mockResolvedValue({
      text: '```html\n<p>Copy</p>\n```',
    });

    const result = await firstValueFrom(
      service.generateProductDescription({
        title: 'Camisa',
        imageUrls: ['https://cdn.example/blocked.jpg'],
      }),
    );

    expect(result).toBe('<p>Copy</p>');
    const textPart = generateContent.mock.calls[0][0].contents[0];
    expect(typeof textPart).toBe('string');
    expect(textPart).toContain('https://cdn.example/blocked.jpg');
  });

  it('propagates API failures', async () => {
    generateContent.mockRejectedValue(new Error('quota'));

    await expect(
      firstValueFrom(
        service.generateProductDescription({
          title: 'Producto',
          imageUrls: [],
        }),
      ),
    ).rejects.toThrow('quota');
  });

  it('throws on empty model response', async () => {
    generateContent.mockResolvedValue({ text: '   ' });

    await expect(
      firstValueFrom(
        service.generateProductDescription({
          title: 'Producto',
          imageUrls: [],
        }),
      ),
    ).rejects.toThrow('GEMINI_EMPTY_RESPONSE');
  });
});
