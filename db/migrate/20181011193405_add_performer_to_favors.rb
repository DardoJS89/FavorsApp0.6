class AddPerformerToFavors < ActiveRecord::Migration[5.2]
  def change
    add_reference :favors, :peformer, foreign_key: {to_table: :users}
  end
end
