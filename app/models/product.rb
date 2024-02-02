class Product < ApplicationRecord
  has_one_attached :image do |attachable|
    attachable.variant :small_thumb, resize_to_limit: [150, 150]
    attachable.variant :mid1_thumb, resize_to_limit: [216, 216]
    attachable.variant :mid2_thumb, resize_to_limit: [300, 300]
    attachable.variant :big1_thumb, resize_to_limit: [450, 450]
    attachable.variant :big2_thumb, resize_to_limit: [600, 600]
  end

  attr_accessor :remove_image

  before_save :purge_image, if: :remove_image

  belongs_to :category

  validates :name, :description, :price, presence: true


  def purge_image
    image.purge_later
  end
end
