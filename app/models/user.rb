class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_one_attached :image do |attachable|
  attachable.variant :cart_avatar, resize_to_limit: [45, 45]
  attachable.variant :small_avatar, resize_to_limit: [100, 100]
  attachable.variant :small_thumb, resize_to_limit: [150, 150]
  attachable.variant :mid1_avatar, resize_to_limit: [176, 176]
  attachable.variant :mid1_thumb, resize_to_limit: [216, 216]
  attachable.variant :mid2_thumb, resize_to_limit: [300, 300]
  attachable.variant :big1_thumb, resize_to_limit: [380, 380]
  attachable.variant :big2_thumb, resize_to_limit: [450, 450]
  attachable.variant :big3_thumb, resize_to_limit: [600, 600]
end

  validates :name, :phone, presence: true

  enum role: { user: 'user', admin: 'admin' }

  has_many :addresses
  has_many :orders

  attr_accessor :remove_image

  before_save :purge_image, if: :remove_image

    

end

