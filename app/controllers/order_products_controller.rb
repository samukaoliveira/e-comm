class OrderProductsController < ApplicationController
  before_action :set_order_product, only: %i[ show edit update destroy ]
  before_action :set_order, only: %i[ show edit update destroy ]

  # GET /order_products or /order_products.json
  def index
    @order = Order.find(params[:order_id])
  @order_products = @order.order_products
  end

  # GET /order_products/1 or /order_products/1.json
  def show
  end

  # GET /order_products/new
  def new
    @order = current_user.orders.find_by(id: params[:order_id]) || current_user.orders.build
    @order_product = @order.order_products.build
  end

  # GET /order_products/1/edit
  def edit
  end

  # POST /order_products or /order_products.json
  def create
    @order = current_user.orders.find(params[:order_id])
    @order_product = @order.order_products.build(order_product_params)

      respond_to do |format|
        if @order_product.save
          format.html { redirect_to order_path(@order), notice: "Order product was successfully created." }
          format.json { render :show, status: :created, location: @order_product }
        else
          format.html { render :new, status: :unprocessable_entity }
          format.json { render json: @order_product.errors, status: :unprocessable_entity }
        end
      end
  end

  # PATCH/PUT /order_products/1 or /order_products/1.json
  def update
    respond_to do |format|
      if @order_product.update(order_product_params)
        format.html { redirect_to order_product_url(@order_product), notice: "Order product was successfully updated." }
        format.json { render :show, status: :ok, location: @order_product }
      else
        format.html { render :edit, status: :unprocessable_entity }
        format.json { render json: @order_product.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /order_products/1 or /order_products/1.json
  def destroy
    @order_product.destroy

    respond_to do |format|
      format.html { redirect_to order_path(@order), notice: "Order product was successfully destroyed." }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_order
      @order = current_user.orders.find(params[:order_id])
    end

    def set_order_product
      @order_product = OrderProduct.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def order_product_params
      params.require(:order_product).permit(:order_id, :product_id, :value, :amount)
    end
end
