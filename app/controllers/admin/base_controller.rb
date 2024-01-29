module Admin
    class BaseController < ApplicationController
        layout 'admin'
        before_action :authenticate_user!
        before_action :only_user!


        private

        def only_user!
            redirect_to root_path unless current_user.admin?
        end
    end
end