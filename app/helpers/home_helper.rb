module HomeHelper

    def carrinho_count
        itens = current_user.orders.joins(:order_products).distinct.count('order_products.product_id')

        return itens
    end
end
