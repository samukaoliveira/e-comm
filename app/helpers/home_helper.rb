module HomeHelper

    def cart_count
        itens = 0

        if user_signed_in? && @cart.present?
          itens = @cart.count
        end
      
        return itens
    end

    def exists_cart?(id)
        return false if cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            produtos.include?(id.to_s)
    end
end
