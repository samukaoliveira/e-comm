include ProductHelper

class ProductDecorator < SimpleDelegator
    def full_promo
        if promo?
            "<span class=\"text-muted text-decoration-line-through\">R$ #{ActionController::Base.helpers.formataPreco(price)} </span>
            #{ActionController::Base.helpers.formataPreco(promo_price)} %>".html_safe
        else
            ActionController::Base.helpers.formataPreco(price)
        end
    end

    def label_promo
        if promo?
            "<div class=\"badge bg-danger text-white position-absolute\" style=\"top: 0.5rem; right: 0.5rem\">Promoção</div>".html_safe
        end
    end
end