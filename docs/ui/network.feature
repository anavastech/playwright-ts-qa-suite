@ui @network
Feature: Resiliencia de red y monitoreo de errores en SauceDemo
  Como cliente de la tienda
  Quiero poder comprar aunque fallen recursos secundarios
  Y como equipo, quiero que los errores del front lleguen al monitoreo

  # Los fallos de red se simulan interceptando el tráfico del navegador (page.route):
  # no dependen de que el fallo ocurra de verdad.

  @TC-NET-01 @regression
  Scenario: El catálogo sigue usable si las imágenes de producto no cargan
    Given las imágenes de producto fallan al descargarse
    And estoy en la página de login
    When ingreso las credenciales de "standard_user"
    Then el inventario lista 6 productos con nombre y precio
    And cada imagen de producto tiene texto alternativo
    When agrego al carrito el producto "Sauce Labs Backpack"
    Then el badge del carrito muestra "1"

  @TC-NET-02 @regression
  Scenario: La compra se completa aunque los servicios de terceros estén caídos
    Given fallan todas las peticiones a dominios externos (fuentes, telemetría)
    And estoy autenticado en el inventario
    And agrego al carrito el producto "Sauce Labs Backpack"
    When inicio el checkout desde el carrito
    And completo mis datos de envío
    And finalizo la compra
    Then veo la confirmación "Thank you for your order!"
    And el sitio intentó al menos una petición a un dominio externo

  # El reporte se responde con un mock: no se envían reportes reales a backtrace.io.
  @TC-NET-03 @regression @known-defect
  Scenario: Defecto conocido - el fallo de error_user se reporta al monitoreo
    Given el servicio de monitoreo de errores responde con un mock
    And estoy autenticado como "error_user"
    When agrego al carrito el producto "Sauce Labs Bolt T-Shirt"
    Then se envía un reporte de error con "Failed to add item to the cart"
    And la página lanza el error "Failed to add item to the cart."
    But el badge del carrito no aparece

  # Automatizado en: tests/ui/network.spec.ts
