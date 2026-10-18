@ui @login
Feature: Login en SauceDemo
  Como usuario de la tienda
  Quiero poder autenticarme
  Para acceder al catálogo de productos

  @TC-LOGIN-01 @smoke
  Scenario: Login exitoso con usuario estándar
    Given estoy en la página de login
    When ingreso las credenciales de "standard_user"
    Then estoy en la página de inventario

  @TC-LOGIN-02 @negative
  Scenario: Usuario bloqueado no puede ingresar
    Given estoy en la página de login
    When ingreso las credenciales de "locked_out_user"
    Then veo el mensaje de error "Sorry, this user has been locked out"

  @TC-LOGIN-03 @negative
  Scenario: Campos vacíos no permiten enviar el formulario
    Given estoy en la página de login
    When intento ingresar sin usuario ni contraseña
    Then veo el mensaje de error "Username is required"

  # performance_glitch_user es funcionalmente válido pero con latencia inducida:
  # se le da un margen explícito mayor en vez de subir el timeout global.
  @TC-LOGIN-04 @regression
  Scenario: Usuario con latencia eventualmente ingresa
    Given estoy en la página de login
    When ingreso las credenciales de "performance_glitch_user"
    Then estoy en la página de inventario en menos de 10 segundos

  @TC-LOGIN-05 @smoke
  Scenario: Cerrar sesión vuelve a la página de login
    Given estoy autenticado en el inventario
    When cierro sesión desde el menú
    Then vuelvo a la página de login

  @TC-LOGIN-06 @negative
  Scenario: No se puede acceder al inventario tras cerrar sesión
    Given estoy autenticado en el inventario
    When cierro sesión desde el menú
    And intento navegar directamente a "inventory.html"
    Then no estoy en la página de inventario
    And veo el mensaje de error "You can only access '/inventory.html' when you are logged in"

  # Automatizado en: tests/ui/login.spec.ts
