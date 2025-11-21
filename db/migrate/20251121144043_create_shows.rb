class CreateShows < ActiveRecord::Migration[7.2]
  def change
    create_table :shows do |t|
      t.string :title
      t.datetime :date
      t.string :location

      t.timestamps
    end
  end
end
