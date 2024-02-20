class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_one_attached :avatar do |attachable|
    attachable.variant :small_thumb, resize_to_limit: [100, 100]
    attachable.variant :mid1_thumb, resize_to_limit: [200, 200]
  end

  validates :name, :phone, presence: true

  enum role: { user: 'user', admin: 'admin' }

  has_many :enderecos

    

end
