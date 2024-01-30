module Admin
  class ProductsController < BaseController
    before_action :set_product, only: %i[ show edit update destroy ]

    # GET /categories or /categories.json
    def index
      @products = Product.all
      
    end

    # GET /categories/1 or /categories/1.json
    def show; end

    # GET /categories/new
    def new
      @product = Product.new
      @categories = Category.all
    end

    # GET /categories/1/edit
    def edit; end

    # POST /categories or /categories.json
    def create

      # params[:products][:category_id] = params[:product][:category_id].to_i if params[:product][:category_id]

      @product = Product.new(product_params)

      respond_to do |format|
        if @product.save
          format.html { redirect_to admin_products_path(@product), notice: 'Produto foi criada com sucesso.' }
        else
          format.html { render :new, status: :unprocessable_entity }
        end
      end
    end

    # PATCH/PUT /categories/1 or /categories/1.json
    def update
      respond_to do |format|
        if @product.update(product_params)
          format.html { redirect_to admin_products_path(@product), notice: 'Produto foi atualizada com sucesso.' }
        else
          format.html { render :edit, status: :unprocessable_entity }
        end
      end
    end

    # DELETE /categories/1 or /categories/1.json
    def destroy
      #@category = Category.find(params[:id])
      unless @product.nil?
        @product.destroy
        respond_to do |format|
          format.html { redirect_to admin_products_path, notice: 'Produto excluído com sucesso.' }
        end
      else
        respond_to do |format|
          format.html { redirect_to admin_products_path, notice: 'Produto não encontrado.' }
        end
      end  
      
    end

    private
      # Use callbacks to share common setup or constraints between actions.
      def set_product
        @product = Product.find(params[:id])
      end

      # Only allow a list of trusted parameters through.
      def product_params
        params.require(:product).permit(:name, :description, :price, :publish, :category_id)
      end
  end
end