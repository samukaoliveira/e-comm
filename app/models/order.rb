class Order < ApplicationRecord
  belongs_to :user
  has_many :order_products
  has_many :products, through: :order_products

  


  # def total_value
  #   order.includes(current_user).products.each do | s|
  #     total += s.value
  #   end

  #   return total
  # end
end
