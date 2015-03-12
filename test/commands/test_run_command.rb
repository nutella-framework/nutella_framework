require 'helper'

module Nutella

  class TestRunCommand < MiniTest::Test

    # Create a fake app
    New.new.run ['test_app']
    Dir.chdir 'test_app'
    Nutella::Install.new.run ['basic-ruby-bot', 'bot1']
    Dir.chdir '..'


    should 'parse app long argument' do
      Dir.chdir 'test_app'
      # File.open('nutella.json', 'r') do |f|
      #   f.each_line do |line|
      #     puts line
      #   end
      # end
      Dir.chdir '..'
      # params =  @@run_cmd.send( :extract_parameters, ['--with=bot1,bot2,bot3'] )
      # assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
    end

    should 'parse without long argument' do
      Dir.chdir 'test_app'
      # File.open('nutella.json', 'r') do |f|
      #   f.each_line do |line|
      #     puts line
      #   end
      # end
      Dir.chdir '..'
      # params =  @@run_cmd.send( :extract_parameters, ['--without=botA,botB,botC'] )
      # assert_equal ['botA', 'botB', 'botC'], params[:without]
    end
    #
    # should 'parse with long argument' do
    #   params =  @@run_cmd.send( :extract_parameters, ['--with=botX,botY,botZ'] )
    #   assert_equal ['botX', 'botY', 'botZ'], params[:with]
    # end
    #
    # should 'parse one short argument' do
    #   params =  @@run_cmd.send( :extract_parameters, ['-w=bot1,bot2,bot3'] )
    #   assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
    # end
    #
    # should 'parse two long arguments' do
    #   params =  @@run_cmd.send( :extract_parameters, ['--with=bot1,bot2,bot3', '--without=botA,botB,botC'] )
    #   assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
    #   assert_equal ['botA', 'botB', 'botC'], params[:without]
    # end
    #
    # should 'parse two short arguments' do
    #   params =  @@run_cmd.send( :extract_parameters, ['-wo=bot1,bot2,bot3', '-w=botA,botB,botC'] )
    #   assert_equal ['bot1', 'bot2', 'bot3'], params[:without]
    #   assert_equal ['botA', 'botB', 'botC'], params[:with]
    # end
    #
    # should 'parse one short and one long argument' do
    #   params =  @@run_cmd.send( :extract_parameters, ['--with=bot1,bot2,bot3', '-wo=botA,botB,botC'] )
    #   assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
    #   assert_equal ['botA', 'botB', 'botC'], params[:without]
    # end
    #
    # should 'raise an exception when trying to parse params that do not exist' do
    #   assert_raises (Slop::UnknownOption) { @@run_cmd.send( :extract_parameters, ['--wit=bot1,bot2,bot3', '-o=botA,botB,botC'] ) }
    # end


    # Tear
    MiniTest::Unit.after_tests { FileUtils.rm_r 'test_app' }

  end

end
