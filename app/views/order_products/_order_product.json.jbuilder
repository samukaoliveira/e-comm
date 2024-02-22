json.extract! order_product, :id, :order_id, :product_id, :value, :amount, :created_at, :updated_at
json.url order_product_url(order_product, format: :json)
