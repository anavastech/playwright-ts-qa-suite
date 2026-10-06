import { expect, test } from '../../fixtures/api.fixtures';
import { buildBooking } from '../../utils/testData';

// Casos negativos y de contrato, trazable a docs/booking-api.feature
test.describe('Booking API edge cases', () => {
  test('returns 404 for a booking id that does not exist @TC-BOOK-05 @negative', async ({ request }) => {
    const response = await request.get('/booking/999999999');

    expect(response.status()).toBe(404);
  });

  // Comportamiento real verificado contra la API: un body vacío no se
  // rechaza con 400 (mala práctica de la API), responde 500. Documentamos
  // el comportamiento actual, no el ideal.
  test('creating a booking with an empty body returns a server error @TC-BOOK-06 @negative', async ({
    request,
  }) => {
    const response = await request.post('/booking', { data: {} });

    expect(response.status()).toBe(500);
  });

  // Mismo comportamiento que el body vacío: faltar un campo requerido
  // también deriva en 500 en vez de un 400 con detalle del campo faltante.
  test('creating a booking with missing required fields returns a server error @TC-BOOK-09 @negative', async ({
    request,
  }) => {
    const response = await request.post('/booking', { data: { firstname: 'OnlyFirstName' } });

    expect(response.status()).toBe(500);
  });

  // Comportamiento real verificado contra la API: enviar un tipo inválido
  // (string en vez de number) no se rechaza — la API crea la reserva igual
  // y el campo queda en null. Documentamos el comportamiento actual, no el
  // ideal, y limpiamos el dato creado para no ensuciar el entorno compartido.
  test('creating a booking with an invalid field type silently nulls the field @TC-BOOK-10 @negative', async ({
    request,
    authenticatedRequest,
  }) => {
    const invalidBooking = { ...buildBooking(), totalprice: 'not-a-number' };
    const response = await request.post('/booking', { data: invalidBooking });
    expect(response.status()).toBe(200);
    const created = await response.json();

    try {
      expect(created.booking.totalprice).toBeNull();
    } finally {
      await authenticatedRequest.delete(`/booking/${created.bookingid}`);
    }
  });

  test('rejects an update with a malformed token @TC-BOOK-11 @negative', async ({ request }) => {
    const response = await request.put('/booking/1', {
      data: buildBooking(),
      headers: { Cookie: 'token=this-is-not-a-real-token' },
    });

    expect(response.status()).toBe(403);
  });

  test('rejects a delete with a malformed token @TC-BOOK-12 @negative', async ({ request }) => {
    const response = await request.delete('/booking/1', {
      headers: { Cookie: 'token=this-is-not-a-real-token' },
    });

    expect(response.status()).toBe(403);
  });

  test('health check endpoint responds @TC-BOOK-07 @smoke', async ({ request }) => {
    const response = await request.get('/ping');

    expect(response.status()).toBe(201);
  });

  // Comportamiento real verificado contra la API: credenciales inválidas no
  // devuelven 401/403, responde 200 con { reason: "Bad credentials" }.
  // Documentamos el comportamiento actual, no el ideal.
  test('invalid credentials return 200 with a reason instead of an auth error @TC-BOOK-08 @negative', async ({
    request,
  }) => {
    const response = await request.post('/auth', {
      data: { username: 'not-a-real-user', password: 'wrong-password' },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ reason: 'Bad credentials' });
  });
});
