module ProductHelper    
    
    def status_publish(status)
        @status = status
        if @status == true
            return "Ativo"
        else
            return "Inativo"
        end
    end


    

    def formataPreco(preco)
        if preco != nil
          return "R$ #{number_with_precision(preco, precision: 2, separator: ',')}"
        else
          return "R$ 0,00"
        end
    end

end