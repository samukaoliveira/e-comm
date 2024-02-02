# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

User.create!(name: 'Samuel', email: 'mucabatera-admin@gmail.com', phone: '21912345678',password: '123456', password_confirmation: '123456', role: 'admin')
cat1 = Category.create!(name: 'Plastificações', position: 1, )
cat1.products.create!(name: 'Calendário A4', description: "Calendário no tamanho A4, personalizado. Time: Flamengo",
price: 10.90, publish: true)
cat1.products.create!(name: 'Calendário A4', description: "Calendário no tamanho A4, personalizado. Tema: Natal",
price: 10.90, publish: true)
cat1.products.create!(name: 'Calendário A4', description: "Calendário no tamanho A4, personalizado. Tema: Java",
price: 10.90, publish: true)