require 'helper'

module Nutella

  class TestRunCommand < MiniTest::Test

    @@run_cmd = RunCommand.new


    should 'parse app long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--app=bot1,bot2,bot3'] )
      assert_equal params[:app],  ['bot1', 'bot2', 'bot3']
    end

    should 'parse without long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--without=botA,botB,botC'] )
      assert_equal params[:without],  ['botA', 'botB', 'botC']
    end

    should 'parse with long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--with=botX,botY,botZ'] )
      assert_equal params[:with],  ['botX', 'botY', 'botZ']
    end

    should 'parse one short argument' do
      params =  @@run_cmd.send( :extract_parameters, ['-a=bot1,bot2,bot3'] )
      assert_equal params[:app],  ['bot1', 'bot2', 'bot3']
    end

    should 'parse two long arguments' do
      params =  @@run_cmd.send( :extract_parameters, ['--app=bot1,bot2,bot3', '--without=botA,botB,botC'] )
      assert_equal params[:app],  ['bot1', 'bot2', 'bot3']
      assert_equal params[:without],  ['botA', 'botB', 'botC']
    end

    should 'parse two short arguments' do
      params =  @@run_cmd.send( :extract_parameters, ['-a=bot1,bot2,bot3', '-w=botA,botB,botC'] )
      assert_equal params[:app],  ['bot1', 'bot2', 'bot3']
      assert_equal params[:with],  ['botA', 'botB', 'botC']
    end

    should 'parse one short and one long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--app=bot1,bot2,bot3', '-wo=botA,botB,botC'] )
      assert_equal params[:app],  ['bot1', 'bot2', 'bot3']
      assert_equal params[:without],  ['botA', 'botB', 'botC']
    end

  end

end
