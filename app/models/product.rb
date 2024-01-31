class Product < ApplicationRecord
  has_one_attached :image do |attachable|
    attachable.variant :small_thumb, resize_to_limit: [150, 175]
    attachable.variant :mid_thumb, resize_to_limit: [300, 350]
    attachable.variant :big_thumb, resize_to_limit: [600, 700]
  end

  attr_accessor :remove_image

  before_save :purge_image, if: :remove_image

  belongs_to :category

  validates :name, :description, :price, presence: true


  def purge_image
    image.purge_later
  end
end
