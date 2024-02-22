require 'rails_helper'

RSpec.describe "order_products/index", type: :view do
  before(:each) do
    assign(:order_products, [
      OrderProduct.create!(
        order: nil,
        product: nil,
        value: 2.5,
        amount: "Amount"
      ),
      OrderProduct.create!(
        order: nil,
        product: nil,
        value: 2.5,
        amount: "Amount"
      )
    ])
  end

  it "renders a list of order_products" do
    render
    cell_selector = Rails::VERSION::STRING >= '7' ? 'div>p' : 'tr>td'
    assert_select cell_selector, text: Regexp.new(nil.to_s), count: 2
    assert_select cell_selector, text: Regexp.new(nil.to_s), count: 2
    assert_select cell_selector, text: Regexp.new(2.5.to_s), count: 2
    assert_select cell_selector, text: Regexp.new("Amount".to_s), count: 2
  end
end
