class AddressesController < ApplicationController
    before_action :set_address, only: %i[ show edit update destroy ]

    def index
        @addresses = current_user.address
    end

    def show
    end

    def new
        @address = current_user.address.new
    end

    def create
        @address = current_user.address.new(address_params)
        if @address.save
            redirect to address_path(@address), notice: "Cadastrado com sucesso."
        else
            render :new, status: :unprocessable_entity
        end
    end

    def edit
    end

    def update
    end

    def destroy
    end

    private

    def address_params
        params.require(:address).permit(:name, :street, :number, :neighboarhood, :zipcode, :city, :state)
    end

    def set_address
        @address = Address.find(params[:id])
      end


end
