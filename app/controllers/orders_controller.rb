# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  before_action :authenticate_user!

  def index
    @orders = current_user.orders
  end

  def show
    @order = Order.find(params[:id])
    @order_products = @order.order_products.includes(:product)
  end

  def new
    @order = current_user.orders.build
  end

  def create
    @order = current_user.orders.build(order_params)

    respond_to do |format|
      if @order.save
        format.html { redirect_to @order, notice: "Order was successfully created." }
        format.json { render :show, status: :created, location: @order }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @order.errors, status: :unprocessable_entity }
      end
    end
  end

  def limpar_carrinho
    @order = Order.find(params[:id])
    @order_products = @order.order_products.includes(:product)
  
    if @order_products.destroy_all
      redirect_to order_path(@order), notice: "Itens do carrinho foram removidos com sucesso."
    else
      format.html { render :show, status: :unprocessable_entity }
    end
  end

  private

  def order_params
    params.require(:order).permit(:total_value)
  end
end
