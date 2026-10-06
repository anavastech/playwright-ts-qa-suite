Feature: Carrito en SauceDemo
  Como cliente autenticado
  Quiero gestionar el contenido de mi carrito
  Para llegar a checkout con los productos correctos

  @TC-CART-01
  Scenario: Continuar comprando vuelve al inventario sin perder el carrito
    Given tengo un producto en el carrito
    When presiono "Continue Shopping"
    Then vuelvo al inventario y el carrito conserva el producto

  @TC-CART-02
  Scenario: Quitar un producto directamente desde el carrito
    Given tengo dos productos en el carrito
    When quito uno desde la página del carrito
    Then el carrito y el badge reflejan un solo producto

  @TC-CART-03
  Scenario: Defecto conocido - Reset App State no actualiza la lista ya renderizada
    Given tengo un producto en el carrito y estoy viendo esa página
    When reseteo el estado de la app desde el menú
    Then el badge se limpia pero el producto sigue listado hasta recargar

  # Automatizado en: tests/ui/cart.spec.ts (cada tag @TC-CART-XX tiene su test homónimo)
