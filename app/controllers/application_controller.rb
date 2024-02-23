class ApplicationController < ActionController::Base
    

include Pundit::Authorization

    before_action :configure_permitted_parameters, if: :devise_controller?
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

        protected

    def configure_permitted_parameters
        devise_parameter_sanitizer.permit(:sign_up) do |u| 
            u.permit(:name, :email, :password, :password_confirmation, :phone)
        end
    end


    private


    # def user_not_authorized
    #     flash[:notice] = "Você não pode fazer esta ação."
    #     redirect_back(fallback_location: admin_root_path)
    # end
    
end
