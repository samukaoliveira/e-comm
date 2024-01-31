module ProductHelper    
    
    def status_publish(status)
        @status = status
        if @status == true
            return "Ativo"
        else
            return "Inativo"
        end
    end


    def no_image_check(product, size)
        @product = product
        @size = size
        if product.image.attached?
            return image_tag @product.image.variant(@size), class:"card-img-top"
        else
            return image_tag 'no_image', height: @size, class:"card-img-top"
        end
    end

    def formataPreco(preco)
        if preco != nil
          return number_with_precision(preco, precision: 2, separator: ',')
        else
          return "0,00"
        end
    end

end