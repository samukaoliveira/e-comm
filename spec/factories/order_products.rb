FactoryBot.define do
  factory :order_product do
    order { nil }
    product { nil }
    value { 1.5 }
    amount { "MyString" }
  end
end
