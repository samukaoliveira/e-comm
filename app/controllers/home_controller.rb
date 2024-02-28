class HomeController < ApplicationController
  #before_action :cart


  def index
    if params[:tipo_categoria].present?
      @products = Product.where(category_id: params[:tipo_categoria]).map { |product| ProductPresenter.new(product) }
    elsif params[:name].present?
      @products = Product.where("lower(name) ilike '%#{params[:name]}%'").map { |product| ProductPresenter.new(product) }
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
    current_path = request.fullpath
    if cookies[:cart].present?
      produtos = JSON.parse(cookies[:cart])
    else
      produtos = []
    end

    produto = {}
    produto["id"] = params[:produto_id]
    produto["qt"] = 1

    produtos << produto
    produtos.uniq!

    cookies[:cart] = { value: produtos.to_json, expires: 1.year.from_now, httponly: true}
    redirect_to current_path

  end


  def increase_item
    current_path = request.fullpath
   
    produtos = JSON.parse(cookies[:cart])
    produto = produtos.find { |p| p["id"].to_i == params[:produto_id].to_i }
    
    qt = produto["qt"].to_i
    
    produto["qt"] = (qt+1)
    

    produtos << produto

    produtos.uniq!

    cookies[:cart] = { value: produtos.to_json, expires: 1.year.from_now, httponly: true}
    redirect_to current_path

  end


  def decrease_item
    current_path = request.fullpath
   
    produtos = JSON.parse(cookies[:cart])
    produto = produtos.find { |p| p["id"].to_i == params[:produto_id].to_i }
    
    qt = produto["qt"].to_i
    
    produto["qt"] = (qt-1)
    

    produtos << produto

    produtos.uniq!

    cookies[:cart] = { value: produtos.to_json, expires: 1.year.from_now, httponly: true}
    redirect_to current_path

  end



  def remove_to_cart
    current_path = request.fullpath
  
    if cookies[:cart].blank?
      redirect_to '/'
      return
    else
      produto_id = params[:produto_id].to_i
  
      produtos = JSON.parse(cookies[:cart])
      produtos.reject! { |produto| produto["id"].to_i == produto_id }
  
      cookies[:cart] = { value: produtos.to_json, expires: 1.year.from_now, httponly: true }
      redirect_to current_path
    end
  end

  def delete_cart
    current_path = request.fullpath
    if cookies[:cart].exists?
      cookies[:cart].delete
      redirect_to '/'
      return
    end

  end


  def cart
    if cookies[:cart].blank?
      redirect_to '/'
      return
    else
      cart = JSON.parse(cookies[:cart])
      product_ids = cart.map { |product| product["id"] }
      @cart = Product.where(id: product_ids)
    end

  end



end
