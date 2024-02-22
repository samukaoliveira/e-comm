class AddToUserColumnCpf < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :cpf, :integer
  end
end
