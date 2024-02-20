class PerfilController < ApplicationController
  def index
  end

  def update_user
    if current_user.update(user_params)
      redirect_to perfil_index_path, notice: "Seus dados foram atualizados com sucesso."
    else
      render :index
    end
  end



  private


  def user_params
    params.require(:user).permit(:name, :phone, :avatar)
  end
end
