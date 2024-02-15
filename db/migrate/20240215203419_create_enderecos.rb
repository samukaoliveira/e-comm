class CreateEnderecos < ActiveRecord::Migration[7.0]
  def change
    create_table :enderecos do |t|
      t.string :logradouro
      t.integer :numero
      t.string :complemento
      t.string :bairro
      t.string :cidade
      t.string :estado
      t.integer :cep
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
