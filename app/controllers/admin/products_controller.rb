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
      @product = authorize Product.new
    rescue Pundit::NotAuthorizedError
      flash[:notice] = "Você só pode cadastrar um produto se tiver uma categoria cadastrada."
      redirect_to action: :index

      #@categories = Category.all
    end

    # GET /categories/1/edit
    def edit; end

    # POST /categories or /categories.json
    def create

      # params[:products][:category_id] = params[:product][:category_id].to_i if params[:product][:category_id]

      @product = Product.new(product_params)

      respond_to do |format|
        if @product.save
          format.html { redirect_to admin_product_path(@product), notice: 'Produto foi criada com sucesso.' }
        else
          format.html { render :new, status: :unprocessable_entity }
        end
      end
    end

    # PATCH/PUT /categories/1 or /categories/1.json
    def update
      
        if @product.update(product_params)
          if params[:product][:remove_image] == '1'
            @product.image.purge  # Isso exclui permanentemente a imagem associada ao modelo
          end
          redirect_to admin_product_path(@product), notice: 'Produto foi atualizada com sucesso.'
        else
          render :edit, status: :unprocessable_entity
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
        params.require(:product).permit(:name, :description, :price, :publish, :image, :category_id)
      end
  end
end