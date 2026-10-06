import { faker } from '@faker-js/faker';
import { expect, test } from '../../fixtures/api.fixtures';
import { bookingSchema, createBookingResponseSchema } from '../../utils/schemas';
import { buildBooking } from '../../utils/testData';

// CRUD completo sobre /booking, trazable a docs/booking-api.feature
test.describe('Booking API', () => {
  test('returns a valid authentication token @TC-BOOK-01 @smoke', async ({ authToken }) => {
    expect(authToken).toEqual(expect.any(String));
    expect(authToken.length).toBeGreaterThan(0);
  });

  test('creates, reads, updates and deletes a booking @TC-BOOK-02 @smoke @regression', async ({
    request,
    authenticatedRequest,
  }) => {
    const newBooking = buildBooking();

    // Create
    const createResponse = await request.post('/booking', { data: newBooking });
    expect(createResponse.status()).toBe(200);
    const created = createBookingResponseSchema.parse(await createResponse.json());
    const bookingId = created.bookingid;
    expect(created.booking.firstname).toBe(newBooking.firstname);

    // Read
    const getResponse = await request.get(`/booking/${bookingId}`);
    expect(getResponse.status()).toBe(200);
    const fetched = bookingSchema.parse(await getResponse.json());
    expect(fetched.totalprice).toBe(newBooking.totalprice);

    // Update (requiere token)
    const updatedPrice = faker.number.int({ min: 501, max: 1000 });
    const updateResponse = await authenticatedRequest.put(`/booking/${bookingId}`, {
      data: { ...newBooking, totalprice: updatedPrice },
    });
    expect(updateResponse.status()).toBe(200);
    const updated = await updateResponse.json();
    expect(updated.totalprice).toBe(updatedPrice);

    // Delete (requiere token)
    const deleteResponse = await authenticatedRequest.delete(`/booking/${bookingId}`);
    expect(deleteResponse.status()).toBe(201);

    const getAfterDelete = await request.get(`/booking/${bookingId}`);
    expect(getAfterDelete.status()).toBe(404);
  });

  test('rejects an update without a token @TC-BOOK-03 @negative', async ({ request }) => {
    const response = await request.put('/booking/1', { data: buildBooking() });

    expect(response.status()).toBe(403);
  });

  test('partially updates a booking with PATCH @TC-BOOK-04 @regression', async ({
    request,
    authenticatedRequest,
  }) => {
    const newBooking = buildBooking();
    const createResponse = await request.post('/booking', { data: newBooking });
    const { bookingid: bookingId } = await createResponse.json();

    try {
      const newPrice = faker.number.int({ min: 501, max: 1000 });
      const patchResponse = await authenticatedRequest.patch(`/booking/${bookingId}`, {
        data: { totalprice: newPrice },
      });

      expect(patchResponse.status()).toBe(200);
      const patched = await patchResponse.json();
      expect(patched.totalprice).toBe(newPrice);
      // El resto de los campos no debe verse afectado por la actualización parcial.
      expect(patched.firstname).toBe(newBooking.firstname);
    } finally {
      // Limpieza: no dejamos datos huérfanos en el entorno compartido de restful-booker.
      await authenticatedRequest.delete(`/booking/${bookingId}`);
    }
  });
});
