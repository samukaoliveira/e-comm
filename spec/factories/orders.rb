FactoryBot.define do
  factory :order do
    user { nil }
    total_value { 1.5 }
  end
end
