module HomeHelper

    def carrinho_count
        itens = 0
        itens = current_user.orders.joins(:order_products).distinct.count('order_products.product_id') if user_signed_in?

        return itens
    end

    def exists_cart?(id)
        return false if cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            produtos.include?(id.to_s)
    end
end
