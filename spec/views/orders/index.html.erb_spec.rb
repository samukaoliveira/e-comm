require 'rails_helper'

RSpec.describe "orders/index", type: :view do
  before(:each) do
    assign(:orders, [
      Order.create!(
        user: nil,
        total_value: 2.5
      ),
      Order.create!(
        user: nil,
        total_value: 2.5
      )
    ])
  end

  it "renders a list of orders" do
    render
    cell_selector = Rails::VERSION::STRING >= '7' ? 'div>p' : 'tr>td'
    assert_select cell_selector, text: Regexp.new(nil.to_s), count: 2
    assert_select cell_selector, text: Regexp.new(2.5.to_s), count: 2
  end
end
