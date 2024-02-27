module HomeHelper

    def cart_count
        itens = 0

        unless cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            itens = produtos.count
          end
      
        return itens
    end

    def cart_price(c)
        price = c

            if c.promo?
                price = c.promo_price.to_f
            else
                price = c.price.to_f
            end

        return price

    end

    def cart_sum
        total = 0

        @cart.each do |c|
            if c.promo?
                total += c.promo_price.to_f
            else
                total += c.price.to_f
            end
        end
        return total

    end

    def cart_sum_descont
        descont = 0

        @cart.each do |c|
            descont += c.price.to_f - c.promo_price.to_f if c.promo?
        end

        return descont

    end

    def exists_cart?(id)
        return false if cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            produtos.include?(id.to_s)
    end
end
