import { z } from 'zod';

// Contrato de /booking documentado una sola vez y reutilizado por todos los
// specs de API: si restful-booker cambia de forma, falla acá con un mensaje
// claro de zod en vez de con un `toBe` suelto que no explica qué campo cambió.
export const bookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({
    checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  additionalneeds: z.string().optional(),
});

export const createBookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: bookingSchema,
});

export const bookingIdsResponseSchema = z.array(
  z.object({
    bookingid: z.number(),
  })
);
