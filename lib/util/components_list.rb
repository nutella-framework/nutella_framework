module Nutella
  
end
# Utility methods to list components
class ComponentsList

  # Returns all the components in a certain directory
  def self.components_in_dir( dir )
    Dir.entries(dir).select {|entry| File.directory?(File.join(dir, entry)) && !(entry =='.' || entry == '..') }
  end


  # Executes a code block for each component in a certain directory
  # @param [String] dir directory where we are iterating
  # @yield [component] Passes the component name to the block
  def self.for_each_component_in_dir( dir, &block )
    components_in_dir(dir).each { |component| block.call component }
  end


  # Returns the list of run-level bots for this run
  # Depending on the mode we are in, we want to start only some bots, exclude only some bots or start all bots
  def self.run_level_bots_list( app_path, params )
    # Fetch the list of all components in the bots dir
    all_bots = components_in_dir "#{app_path}/bots/"
    # Fetch the list of app bots
    app_bots = Nutella.current_app.config['app_bots']
    # Return correct list based on the mode we are in
    case start_mode(params)
      when :WITH
        return  get_with_bots_list params[:with], app_bots
      when :WO
        return get_wo_bots_list all_bots, app_bots, params[:without]
      when :ALL
        return get_all_bots_list all_bots, app_bots
      else
        # If we get here it means we are both in with and without mode and something went very wrong...
        raise 'You are using simultaneously with and without modes. This should not happen. Please contact developers.'
    end
  end


  #--- Private class methods --------------


  def self.start_mode(params)
    return :WITH unless params[:with].empty?
    return :WO unless params[:without].empty?
    :ALL if params[:with].empty? && params[:without].empty?
  end
  private_class_method :start_mode

  # If we are in "with mode", we want to run only the bots in the "with list" (minus the ones in app_bots_list)
  def self.get_with_bots_list( incl_bots, app_bots)
    return app_bots.nil? ? incl_bots : incl_bots - app_bots
  end
  private_class_method :get_with_bots_list

  # If we are in "without mode", we want to run all the bots in the bots_list minus the ones in the "without list" and in the "app bots list"
  def self.get_wo_bots_list( all_bots, app_bots, excl_bots )
    return app_bots.nil? ? all_bots - excl_bots : all_bots - excl_bots - app_bots
  end
  private_class_method :get_wo_bots_list

  # If we are in "all mode", we want to run all the bots minus the ones in the "app bots list"
  def self.get_all_bots_list( all_bots, app_bots )
    return app_bots.nil? ? all_bots : all_bots - app_bots
  end
  private_class_method :get_all_bots_list

end