class Product < ApplicationRecord
  has_one_attached :image
  belongs_to :category

  validates :name, :description, :price, presence: true
end
