require 'rails_helper'

RSpec.describe "order_products/show", type: :view do
  before(:each) do
    assign(:order_product, OrderProduct.create!(
      order: nil,
      product: nil,
      value: 2.5,
      amount: "Amount"
    ))
  end

  it "renders attributes in <p>" do
    render
    expect(rendered).to match(//)
    expect(rendered).to match(//)
    expect(rendered).to match(/2.5/)
    expect(rendered).to match(/Amount/)
  end
end
