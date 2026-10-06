Feature: Checkout en SauceDemo
  Como cliente autenticado
  Quiero completar la compra de un producto
  Para finalizar mi pedido

  @TC-CHK-01
  Scenario: Compra exitosa de punta a punta
    Given estoy autenticado y tengo un producto en el carrito
    When completo mis datos de envío
    And finalizo la compra
    Then veo la confirmación "Thank you for your order!"

  @TC-CHK-02
  Scenario: No se puede continuar sin código postal
    Given estoy autenticado y tengo un producto en el carrito
    When completo mis datos de envío sin código postal
    Then veo el mensaje "Postal Code is required"

  @TC-CHK-03
  Scenario: El total coincide con subtotal más impuestos
    Given estoy autenticado y tengo varios productos en el carrito
    When completo mis datos de envío
    Then el total mostrado es igual al subtotal más el impuesto

  @TC-CHK-04
  Scenario: error_user no puede finalizar la compra
    Given estoy autenticado como "error_user" y tengo un producto en el carrito
    When completo mis datos de envío y presiono "Finish"
    Then permanezco en el paso de resumen sin confirmación de compra

  @TC-CHK-05
  Scenario: Cancelar en el paso de información vuelve al carrito
    Given estoy autenticado y tengo un producto en el carrito
    When presiono "Cancel" en el paso de información
    Then vuelvo al carrito y el producto sigue ahí

  @TC-CHK-06
  Scenario: Cancelar en el paso de resumen vuelve al inventario
    Given completé mis datos de envío
    When presiono "Cancel" en el paso de resumen
    Then vuelvo al inventario y el carrito conserva el producto

  # Automatizado en: tests/ui/checkout.spec.ts (cada tag @TC-CHK-XX tiene su test homónimo)
