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
        if product.image.attached?
            return image_tag product.image.variant(size), class:""
        else
            default_size = case size
                            when :small_thumb then '150x150'
                            when :mid1_thumb then '216x216'
                            when :mid2_thumb then '300x300'
                            when :big_thumb then '600x600'
                            else '150x150'
                            end
            return image_tag 'no_image', size: default_size, class:""
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