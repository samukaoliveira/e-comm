class HomeController < ApplicationController
  def index
    if params[:tipo_categoria].present?
      @products = Product.where(category_id: params[:tipo_categoria]).map { |product| ProductPresenter.new(product) }
    else
      @products = Product.all.map { |product| ProductPresenter.new(product) }
    end
  
    @order = current_user.orders.new if user_signed_in?
  end

  def cart
  end
end
