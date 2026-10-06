import { request } from '@playwright/test';
import { API_BASE_URL } from './playwright.config';

// Pre-flight check: si restful-booker está caído, preferimos fallar rápido
// con un mensaje claro en vez de dejar que cada test falle individualmente
// con timeouts de red confusos.
export default async function globalSetup() {
  const context = await request.newContext({ baseURL: API_BASE_URL });

  try {
    const response = await context.get('/ping', { timeout: 10_000 });
    if (!response.ok()) {
      throw new Error(`"${API_BASE_URL}/ping" respondió ${response.status()}`);
    }
  } catch (error) {
    throw new Error(
      `No se pudo verificar que la API de restful-booker esté disponible antes de correr la suite. ` +
        `Detalle: ${(error as Error).message}`
    );
  } finally {
    await context.dispose();
  }
}
