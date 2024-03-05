module ApplicationHelper

    def no_image_check(model, size, iclass = "")
        if model.image.attached?
            return image_tag model.image.variant(size), class: iclass
        else
            default_size = case size
                            when :cart_avatar then '45x45'
                            when :small_avatar then '100x100'
                            when :small_thumb then '150x150'
                            when :mid1_avatar then '180x180'
                            when :mid1_thumb then '216x216'
                            when :mid2_thumb then '300x300'
                            when :big1_thumb then '380x380'
                            when :big2_thumb then '450x450'
                            when :big3_thumb then '600x600'
                            else '150x150'
                            end
            return image_tag 'no_image', size: default_size, class: iclass
        end
    end

    def image_purge(model)
        return model.image.purge
    end
end
