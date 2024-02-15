FactoryBot.define do
  factory :endereco do
    logradouro { "MyString" }
    numero { 1 }
    complemento { "MyString" }
    bairro { "MyString" }
    cidade { "MyString" }
    estado { "MyString" }
    cep { 1 }
    user { nil }
  end
end
