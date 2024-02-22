require "rails_helper"

RSpec.describe OrderProductsController, type: :routing do
  describe "routing" do
    it "routes to #index" do
      expect(get: "/order_products").to route_to("order_products#index")
    end

    it "routes to #new" do
      expect(get: "/order_products/new").to route_to("order_products#new")
    end

    it "routes to #show" do
      expect(get: "/order_products/1").to route_to("order_products#show", id: "1")
    end

    it "routes to #edit" do
      expect(get: "/order_products/1/edit").to route_to("order_products#edit", id: "1")
    end


    it "routes to #create" do
      expect(post: "/order_products").to route_to("order_products#create")
    end

    it "routes to #update via PUT" do
      expect(put: "/order_products/1").to route_to("order_products#update", id: "1")
    end

    it "routes to #update via PATCH" do
      expect(patch: "/order_products/1").to route_to("order_products#update", id: "1")
    end

    it "routes to #destroy" do
      expect(delete: "/order_products/1").to route_to("order_products#destroy", id: "1")
    end
  end
end
