module Admin
  class HomeController < BaseController
    def index
    end

    def show
      @product = Product.find(params[:id])
      
    end
  end
end