import { faker } from '@faker-js/faker';
import { expect, test } from '../../fixtures/api.fixtures';
import { bookingIdsResponseSchema } from '../../utils/schemas';
import { buildBooking } from '../../utils/testData';

// Búsqueda vía GET /booking?firstname=&lastname=&checkin=&checkout=
// Trazable a docs/api/booking-search.feature
test.describe('Booking API search', { tag: ['@api', '@booking'] }, () => {
  test('filters bookings by firstname and lastname @TC-BOOK-13 @regression', async ({
    request,
    authenticatedRequest,
  }) => {
    const booking = buildBooking({ firstname: `Qa${faker.string.alphanumeric(8)}` });
    const created = await (await request.post('/booking', { data: booking })).json();

    try {
      const response = await request.get(
        `/booking?firstname=${booking.firstname}&lastname=${booking.lastname}`
      );
      expect(response.status()).toBe(200);
      const matches = bookingIdsResponseSchema.parse(await response.json());

      expect(matches.map((m) => m.bookingid)).toContain(created.bookingid);
    } finally {
      await authenticatedRequest.delete(`/booking/${created.bookingid}`);
    }
  });

  test('returns an empty array when no booking matches the name filter @TC-BOOK-14 @regression', async ({
    request,
  }) => {
    const response = await request.get(`/booking?firstname=NoExiste${faker.string.alphanumeric(10)}`);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });

  // Comportamiento real verificado contra la API: filtrar por checkin/checkout
  // no acota los resultados a reservas con esas fechas exactas (una reserva
  // recién creada con esas fechas no aparece en el resultado). Documentamos
  // el comportamiento actual, no el ideal.
  test('known defect: filtering by exact checkin/checkout does not return the matching booking @TC-BOOK-15 @regression @known-defect', async ({
    request,
    authenticatedRequest,
  }) => {
    const booking = buildBooking();
    const created = await (await request.post('/booking', { data: booking })).json();

    try {
      const response = await request.get(
        `/booking?checkin=${booking.bookingdates.checkin}&checkout=${booking.bookingdates.checkout}`
      );
      expect(response.status()).toBe(200);
      const matches = bookingIdsResponseSchema.parse(await response.json());

      expect(matches.map((m) => m.bookingid)).not.toContain(created.bookingid);
    } finally {
      await authenticatedRequest.delete(`/booking/${created.bookingid}`);
    }
  });
});
