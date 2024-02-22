class AddressesController < ApplicationController
    before_action :set_address, only: %i[ show edit update destroy ]

    def index
        @addresses = current_user.addresses
    end

    def show
    end

    def new
        @address = current_user.addresses.new
    end

    def create
        @address = current_user.addresses.new(address_params)
        if @address.save
            redirect_to address_path(@address), notice: "Cadastrado com sucesso."
        else
            render :new, status: :unprocessable_entity
        end
    end

    def edit
    end

    def update
        if @address.update(address_params)
            redirect_to address_path(@address), notice: 'Endereço foi atualizada com sucesso.'
        else
          render :edit, status: :unprocessable_entity
        end
    end

    def destroy
        if @address.destroy
            redirect_to addresses_path, notice: "Endereço excluído com sucesso."
        else
            flash[:alert] = "Não foi possível excluir este endereço"
        end
    end

    private

    def address_params
        params.require(:address).permit(:name, :street, :number, :complement, :neighboarhood, :zipcode, :city, :state)
    end

    def set_address
        @address = current_user.addresses.find(params[:id])
      end


end
