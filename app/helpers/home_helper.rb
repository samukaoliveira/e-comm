module HomeHelper

    def cart_count
        itens = 0

        unless cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            itens = produtos.count
          end
      
        return itens
    end

    def cart_quantity(prod_id)
        p_id = prod_id
        units = 0

        unless cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            produto = produtos.find { |product| product["id"].to_i == p_id }
            units = produto["qt"].to_i
          end
      
        return units
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
                total += c.promo_price.to_f * cart_quantity(c.id).to_i
            else
                total += c.price.to_f * cart_quantity(c.id).to_i
            end
        end
        return total

    end

    def cart_sum_descont
        descont = 0

        @cart.each do |c|
            descont += (c.price.to_f - c.promo_price.to_f)  * cart_quantity(c.id).to_i if c.promo?
        end

        return descont

    end

    def exists_cart?(id)
        return false if cookies[:cart].blank?
            produtos = JSON.parse(cookies[:cart])
            return produtos.any? { |product| product["id"].to_s == id.to_s }
    end


    def search_empty
     
        return content_tag(:span, "Nenhum resultado emncontrado com os dados fornecidos!", class: "text-danger col-lg-12") if @products.empty?
    end
end
