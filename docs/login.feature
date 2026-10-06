Feature: Login en SauceDemo
  Como usuario de la tienda
  Quiero poder autenticarme
  Para acceder al catálogo de productos

  @TC-LOGIN-01
  Scenario: Login exitoso con usuario estándar
    Given estoy en la página de login
    When ingreso las credenciales de "standard_user"
    Then accedo a la página de inventario

  @TC-LOGIN-02
  Scenario: Usuario bloqueado no puede ingresar
    Given estoy en la página de login
    When ingreso las credenciales de "locked_out_user"
    Then veo el mensaje "Sorry, this user has been locked out"

  @TC-LOGIN-03
  Scenario: Campos vacíos no permiten enviar el formulario
    Given estoy en la página de login
    When intento ingresar sin usuario ni contraseña
    Then veo el mensaje "Username is required"

  @TC-LOGIN-04
  Scenario: Usuario con latencia eventualmente ingresa
    Given estoy en la página de login
    When ingreso las credenciales de "performance_glitch_user"
    Then accedo a la página de inventario, aunque con más demora de lo normal

  @TC-LOGIN-05
  Scenario: Cerrar sesión vuelve a la página de login
    Given estoy autenticado
    When cierro sesión desde el menú
    Then vuelvo a la página de login

  @TC-LOGIN-06
  Scenario: No se puede acceder al inventario tras cerrar sesión
    Given estoy autenticado
    When cierro sesión desde el menú
    And intento navegar directamente a "inventory.html"
    Then veo un mensaje de acceso no autorizado

  # Automatizado en: tests/ui/login.spec.ts (cada tag @TC-LOGIN-XX tiene su test homónimo)
