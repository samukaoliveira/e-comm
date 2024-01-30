class Category < ApplicationRecord

    validates :name, :position, presence: true
    has_many :products
end
