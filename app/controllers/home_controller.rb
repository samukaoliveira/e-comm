class HomeController < ApplicationController
  before_action :cart


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

  def add_to_cart
    if cookies[:cart].present?
      produtos = JSON.parse(cookies[:cart])
    else
      produtos = []
    end

    produtos << params[:produto_id]
    produtos.uniq!

    cookies[:cart] = { value: produtos.to_json, expires: 1.year.from_now, httponly: true}
    redirect_to '/'

  end

  def remove_to_cart
    if cookies[:cart].blank?
      redirect_to '/'
      return
    else
      produtos = JSON.parse(cookies[:cart])
      produtos.delete(params[:produto_id])
      cookies[:cart] = { value: produtos.to_json, expires: 1.year.from_now, httponly: true}
      redirect_to '/'
    end

  end


  def cart
    if cookies[:cart].blank?
      redirect_to '/'
      return
    else
      cart = JSON.parse(cookies[:cart])
      @cart = Product.where(id: cart)
    end

  end

end
