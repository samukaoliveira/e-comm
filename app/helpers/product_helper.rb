module ProductHelper    
    
    def status_publish(status)
        @status = status
        if @status == true
            return "Ativo"
        else
            return "Inativo"
        end
    end

end