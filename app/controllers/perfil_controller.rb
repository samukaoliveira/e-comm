class PerfilController < ApplicationController
  def index
  end

  def update_user
    if current_user.update(user_params)
      if params[:user][:remove_image] == '1'
        current_user.image.purge  # Isso exclui permanentemente a imagem associada ao modelo
      end
      redirect_to perfil_index_path, notice: "Seus dados foram atualizados com sucesso."
    else
      render :index
    end
  end



  private


  def user_params
    params.require(:user).permit(:name, :phone, :image)
  end
end
