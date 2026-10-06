import { type APIRequestContext, test as base, request } from '@playwright/test';
import { API_BASE_URL } from '../playwright.config';
import { BOOKER_ADMIN } from '../utils/testData';

type ApiFixtures = {
  authToken: string;
  authenticatedRequest: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  // restful-booker exige un token para PUT/DELETE. Lo obtenemos una vez por
  // test y lo exponemos ya listo, para que los specs no repitan el POST /auth.
  authToken: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: API_BASE_URL });
    const response = await context.post('/auth', { data: BOOKER_ADMIN });
    const body = await response.json();
    await context.dispose();
    await use(body.token);
  },

  authenticatedRequest: async ({ authToken }, use) => {
    const context = await request.newContext({
      baseURL: API_BASE_URL,
      extraHTTPHeaders: { Cookie: `token=${authToken}` },
    });
    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
