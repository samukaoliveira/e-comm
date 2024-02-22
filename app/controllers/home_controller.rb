class HomeController < ApplicationController
  def index
    @products = Product.all.map{ |product| ProductPresenter.new(product)}
    @order = current_user.orders.new
  end
end
