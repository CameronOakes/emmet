class PagesController < ApplicationController
  def home
  end

  def logo
  end

  def store
  end

  def shows
    @shows = Show.order(date: :asc)
    @show = Show.new
  end

  def create_show
    @show = Show.new(show_params)
    if @show.save
      redirect_to shows_path, notice: 'SHOW_ADDED'
    else
      @shows = Show.order(date: :asc)
      render :shows
    end
  end

  private

  def show_params
    params.require(:show).permit(:title, :date, :location)
  end
end
