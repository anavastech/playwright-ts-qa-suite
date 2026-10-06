Feature: Accesibilidad en SauceDemo
  Como usuario que depende de tecnología de asistencia
  Quiero que las pantallas clave cumplan WCAG 2.0 A/AA
  Para poder usar el sitio sin barreras

  @TC-A11Y-01
  Scenario: Login sin violaciones de accesibilidad
    Given estoy en la página de login
    Then no hay violaciones WCAG 2.0 A/AA

  @TC-A11Y-02
  Scenario: Inventario sin violaciones de accesibilidad
    Given estoy autenticado en el inventario
    Then no hay violaciones WCAG 2.0 A/AA

  @TC-A11Y-03
  Scenario: Paso de información de checkout sin violaciones de accesibilidad
    Given estoy en el paso de información del checkout
    Then no hay violaciones WCAG 2.0 A/AA

  @TC-A11Y-04
  Scenario: Mensaje de error de login sin violaciones de accesibilidad
    Given veo el mensaje de error de "locked_out_user"
    Then no hay violaciones WCAG 2.0 A/AA

  # Automatizado en: tests/ui/accessibility.spec.ts (cada tag @TC-A11Y-XX tiene su test homónimo)
