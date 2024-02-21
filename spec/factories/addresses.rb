FactoryBot.define do
  factory :address do
    name { "MyString" }
    street { "MyString" }
    neighboarhood { "MyString" }
    number { "MyString" }
    zipcode { "MyString" }
    city { "MyString" }
    state { "MyString" }
    main { false }
    user { nil }
  end
end
