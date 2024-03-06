module Admin
  class PerfilController < BaseController
    

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


    def password
    end

    def update_password
      if !current_password_params[:current_password].empty? && current_user.valid_password?(current_password_params[:current_password])
        if current_user.update(password_params)
          bypass_sign_in(current_user)
          redirect_to perfil_index_path, notice: "Seus dados foram atualizados com sucesso."
        else
          render :password, status: :unprocessable_entity
        end
      else
        flash[:error] = "Você precisa informar sua senha atual para fazer a alteração."
        redirect_to password_perfil_index_path
      end

    end


    private


    def user_params
      params.require(:user).permit(:name, :phone, :image)
    end

    def current_password_params
      params.require(:user).permit(:current_password)
    end

    def password_params
      params.require(:user).permit(:password, :password_confirmation)
    end
  end
end