@ui @inventory
Feature: Catálogo de productos en SauceDemo
  Como cliente autenticado
  Quiero explorar y filtrar el catálogo
  Para elegir qué comprar

  @TC-INV-01
  Scenario Outline: Ordenar productos por <orden>
    Given estoy autenticado en el inventario
    When ordeno los productos por <orden>
    Then los productos quedan ordenados por <orden>

    @smoke
    Examples: Feedback rápido
      | orden             |
      | precio ascendente |

    @regression
    Examples: Resto de opciones
      | orden              |
      | precio descendente |
      | nombre A a Z       |
      | nombre Z a A       |

  @TC-INV-02 @regression
  Scenario: Reset App State limpia el badge del carrito
    Given estoy autenticado en el inventario
    And agrego al carrito el producto "Sauce Labs Backpack"
    When reseteo el estado de la app desde el menú
    Then el badge del carrito desaparece

  @TC-INV-03 @smoke
  Scenario: El badge del carrito refleja los productos agregados
    Given estoy autenticado en el inventario
    When agrego al carrito los productos:
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    Then el badge del carrito muestra "2"

  @TC-INV-04 @regression
  Scenario: Quitar un producto actualiza el badge del carrito
    Given estoy autenticado en el inventario
    And agrego al carrito los productos:
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    When quito del carrito desde el inventario el producto "Sauce Labs Backpack"
    Then el badge del carrito muestra "1"

  # Bug conocido de la app, verificado manualmente contra el sitio antes de automatizarlo.
  @TC-INV-05 @regression @known-defect
  Scenario: Defecto conocido - problem_user no puede ordenar productos
    Given estoy autenticado como "problem_user"
    When ordeno los productos por nombre Z a A
    Then el orden de los productos no cambia

  # Automatizado en: tests/ui/inventory.spec.ts (@TC-INV-01 son los 4 tests "sorts products by...",
  # uno por fila de Examples)
