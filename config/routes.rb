Rails.application.routes.draw do
  
  devise_for :users, controllers: {
  passwords: 'admin/passwords'
}
  
  #get 'home/index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
   root "home#index"

   namespace :admin do
    root to: "home#index"

    get 'password/edit', to: redirect('users/edit'), as: 'edit_password'
    
    get "categories/", to: "categories#index", as: "categories"
    get "categories/new", to: "categories#new", as: "new_category"
    post "categories", to: "categories#create", as: "create_category"
    get "categories/:id", to: "categories#show", as: "category"
    get "categories/:id/edit", to: "categories#edit", as: "edit_category"
    patch "categories/:id", to: "categories#update", as: "update_category"
    delete "categories/:id", to: "categories#destroy", as: "destroy_category"

    get "products/", to: "products#index", as: "products"
    get "products/new", to: "products#new", as: "new_product"
    post "products", to: "products#create", as: "create_product"
    get "products/:id", to: "products#show", as: "product"
    get "products/:id/edit", to: "products#edit", as: "edit_product"
    patch "products/:id", to: "products#update", as: "update_product"
    delete "products/:id", to: "products#destroy", as: "destroy_product"

      # resources :categories, except: [:destroy] do
    #   #delete "destroy", on: :member, as: "destroy"
      
    # end  
   end

    resources :perfil, only: [:index] do
      collection do
        patch :update_user
      end

      resources :endereco
    end
end


