import { faker } from '@faker-js/faker';

export type BookingInput = {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds: string;
};

// Genera una reserva con datos aleatorios pero consistentes (checkout > checkin).
// Acepta overrides para los tests que necesitan un valor conocido (ej. buscar por nombre).
export function buildBooking(overrides: Partial<BookingInput> = {}): BookingInput {
  const checkin = faker.date.soon({ days: 10 });
  const checkout = faker.date.soon({ days: 10, refDate: checkin });

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 500 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: {
      checkin: checkin.toISOString().split('T')[0],
      checkout: checkout.toISOString().split('T')[0],
    },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Lunch', 'Dinner', 'None']),
    ...overrides,
  };
}

export const SAUCE_USERS = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
  problem: { username: 'problem_user', password: 'secret_sauce' },
  performanceGlitch: { username: 'performance_glitch_user', password: 'secret_sauce' },
  error: { username: 'error_user', password: 'secret_sauce' },
} as const;

export const BOOKER_ADMIN = {
  username: process.env.BOOKER_USERNAME ?? 'admin',
  password: process.env.BOOKER_PASSWORD ?? 'password123',
};
