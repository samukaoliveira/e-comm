class HomeController < ApplicationController
  def index
    if params[:tipo_categoria].present?
      @products = Product.where(category_id: params[:tipo_categoria]).map { |product| ProductPresenter.new(product) }
    else
      @products = Product.all.map { |product| ProductPresenter.new(product) }
    end 
    
    @products = Kaminari.paginate_array(@products).page(params[:page]).per(5)
    @order = current_user.orders.new if user_signed_in?
  end

  def show
    @product = Product.find(params[:id])
  end

  def cart
  end
end
