import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

export {
  createApolloMock,
  createMemoryStorageMock,
} from '../../../../libs/shared/core/src/testing';

export function translateModuleForTests() {
  return TranslateModule.forRoot();
}

export function adminTestProviders() {
  return [provideNoopAnimations(), provideHttpClient()];
}
