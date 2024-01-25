require 'rails_helper'

RSpec.describe User, type: :model do # rubocop:disable Metrics/BlockLength
  context "Espero validar campos obrigatórios" do
    it "Validar o campo nome preenchido" do
      user = build(:user)
      expect(user.valid?).to eq(true)
    end

    it "Validar o campo nome vazio" do
      user = build(:user, name: nil)
      expect(user.valid?).to eq(false)
    end

    it "Validar o campo telefone vazio" do
      user = build(:user, phone: nil)
      expect(user.valid?).to eq(false)
    end

    it "Validar o campo email vazio" do
      user = build(:user, email: nil)
      expect(user.valid?).to eq(false)
    end

    it "Validar o campo password vazio" do
      user = build(:user, password: nil)
      expect(user.valid?).to eq(false)
    end
  end

  context "Valida e-mail" do
    it "Validar mensagem de erro para emails únicos" do
      user1 = create(:user)
      user2 = build(:user, email: user1.email)

      user2.save
      expect(user2.valid?).to eq(false)
      expect(user2.errors.present?).to eq(true)
      expect(user2.errors).to be_positive
      binding.pry
    end
  end
  
end
