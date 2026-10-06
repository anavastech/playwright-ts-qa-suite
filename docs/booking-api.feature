Feature: API de reservas (restful-booker)
  Como sistema cliente
  Quiero gestionar reservas vía API
  Para integrar el flujo de booking sin pasar por la UI

  @TC-BOOK-01
  Scenario: Autenticación devuelve un token válido
    When solicito un token con credenciales de administrador
    Then recibo un token no vacío

  @TC-BOOK-02
  Scenario: Ciclo de vida completo de una reserva
    Given tengo un token de autenticación válido
    When creo una reserva
    Then puedo consultarla por su id
    When actualizo el precio de la reserva
    Then el precio queda actualizado
    When elimino la reserva
    Then ya no puedo consultarla

  @TC-BOOK-03
  Scenario: Actualizar sin token es rechazado
    When intento actualizar una reserva sin token
    Then recibo un 403

  @TC-BOOK-04
  Scenario: Actualización parcial con PATCH
    Given tengo un token de autenticación válido
    And existe una reserva
    When actualizo solo el precio con PATCH
    Then el precio cambia y el resto de los datos no se ve afectado

  # Los escenarios anteriores (@TC-BOOK-01 a 04) están automatizados en: tests/api/booking.spec.ts

  @TC-BOOK-05
  Scenario: Consultar una reserva inexistente
    When consulto una reserva con un id que no existe
    Then recibo un 404

  @TC-BOOK-06
  Scenario: Crear una reserva con body vacío
    When intento crear una reserva sin datos
    Then la API responde con un error de servidor

  @TC-BOOK-07
  Scenario: Endpoint de salud
    When consulto el endpoint de salud
    Then la API responde correctamente

  @TC-BOOK-08
  Scenario: Autenticación con credenciales inválidas
    When solicito un token con credenciales incorrectas
    Then recibo un 200 con la razón "Bad credentials"

  @TC-BOOK-09
  Scenario: Crear una reserva sin campos requeridos
    When intento crear una reserva solo con el nombre
    Then la API responde con un error de servidor

  @TC-BOOK-10
  Scenario: Defecto conocido - tipo de dato inválido no se rechaza
    When creo una reserva con un precio que no es un número
    Then la reserva se crea igual y el campo queda en null

  @TC-BOOK-11
  Scenario: Token malformado es rechazado al actualizar
    When intento actualizar una reserva con un token inválido
    Then recibo un 403

  @TC-BOOK-12
  Scenario: Token malformado es rechazado al borrar
    When intento borrar una reserva con un token inválido
    Then recibo un 403

  # Los escenarios anteriores (@TC-BOOK-05 a 12) están automatizados en: tests/api/booking-edge-cases.spec.ts

  @TC-BOOK-13
  Scenario: Buscar reservas por nombre y apellido
    Given existe una reserva con nombre y apellido conocidos
    When busco por ese nombre y apellido
    Then la reserva aparece en el resultado

  @TC-BOOK-14
  Scenario: Buscar con un nombre que no existe
    When busco reservas con un nombre que no existe
    Then el resultado es una lista vacía

  @TC-BOOK-15
  Scenario: Defecto conocido - filtrar por fechas no acota el resultado
    Given existe una reserva con fechas de checkin y checkout conocidas
    When busco con esas mismas fechas exactas
    Then la reserva no aparece en el resultado

  # Los escenarios anteriores (@TC-BOOK-13 a 15) están automatizados en: tests/api/booking-search.spec.ts
