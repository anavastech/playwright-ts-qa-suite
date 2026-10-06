Feature: Catálogo de productos en SauceDemo
  Como cliente autenticado
  Quiero explorar y filtrar el catálogo
  Para elegir qué comprar

  @TC-INV-01
  Scenario Outline: Ordenar productos por las distintas opciones del combo
    Given estoy autenticado en el inventario
    When ordeno los productos por "<opcion>"
    Then los productos quedan ordenados según "<opcion>"

    Examples:
      | opcion              |
      | precio ascendente   |
      | precio descendente  |
      | nombre A a Z        |
      | nombre Z a A        |

  @TC-INV-02
  Scenario: Reset App State limpia el badge del carrito
    Given tengo un producto en el carrito
    When reseteo el estado de la app desde el menú
    Then el badge del carrito desaparece

  @TC-INV-03
  Scenario: El badge del carrito refleja los productos agregados
    Given estoy autenticado en el inventario
    When agrego dos productos al carrito
    Then el badge del carrito muestra "2"

  @TC-INV-04
  Scenario: Quitar un producto actualiza el badge del carrito
    Given tengo dos productos en el carrito
    When quito uno desde el inventario
    Then el badge del carrito muestra "1"

  @TC-INV-05
  Scenario: Defecto conocido - problem_user no puede ordenar productos
    Given estoy autenticado como "problem_user"
    When intento ordenar los productos de Z a A
    Then el orden de los productos no cambia

  # Automatizado en: tests/ui/inventory.spec.ts (cada tag @TC-INV-XX tiene su test homónimo;
  # @TC-INV-01 son los 4 tests "sorts products by..." generados desde las Examples)
