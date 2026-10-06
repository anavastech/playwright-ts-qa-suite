Feature: Detalle de producto en SauceDemo
  Como cliente autenticado
  Quiero ver el detalle de un producto
  Para decidir si lo agrego al carrito antes de comprarlo

  @TC-PROD-01
  Scenario: El detalle muestra el mismo nombre y precio que el listado
    Given estoy autenticado en el inventario
    When abro el detalle de un producto
    Then veo el mismo nombre y precio que en el listado

  @TC-PROD-02
  Scenario: Agregar y quitar un producto desde su detalle
    Given estoy en el detalle de un producto
    When lo agrego al carrito
    Then el badge del carrito muestra "1"
    When lo quito desde el mismo detalle
    Then el badge del carrito desaparece

  @TC-PROD-03
  Scenario: Volver al listado no pierde el carrito
    Given agregué un producto desde su detalle
    When vuelvo al listado con "Back to products"
    Then sigo en el inventario y el carrito conserva el producto

  # Automatizado en: tests/ui/product-detail.spec.ts (cada tag @TC-PROD-XX tiene su test homónimo)
