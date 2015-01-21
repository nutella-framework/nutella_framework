require 'helper'

module Nutella

  class TestRunCommand < MiniTest::Test

    @@run_cmd = RunCommand.new


    should 'parse app long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--with=bot1,bot2,bot3'] )
      assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
    end

    should 'parse without long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--without=botA,botB,botC'] )
      assert_equal ['botA', 'botB', 'botC'], params[:without]
    end

    should 'parse with long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--with=botX,botY,botZ'] )
      assert_equal ['botX', 'botY', 'botZ'], params[:with]
    end

    should 'parse one short argument' do
      params =  @@run_cmd.send( :extract_parameters, ['-w=bot1,bot2,bot3'] )
      assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
    end

    should 'parse two long arguments' do
      params =  @@run_cmd.send( :extract_parameters, ['--with=bot1,bot2,bot3', '--without=botA,botB,botC'] )
      assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
      assert_equal ['botA', 'botB', 'botC'], params[:without]
    end

    should 'parse two short arguments' do
      params =  @@run_cmd.send( :extract_parameters, ['-wo=bot1,bot2,bot3', '-w=botA,botB,botC'] )
      assert_equal ['bot1', 'bot2', 'bot3'], params[:without]
      assert_equal ['botA', 'botB', 'botC'], params[:with]
    end

    should 'parse one short and one long argument' do
      params =  @@run_cmd.send( :extract_parameters, ['--with=bot1,bot2,bot3', '-wo=botA,botB,botC'] )
      assert_equal ['bot1', 'bot2', 'bot3'], params[:with]
      assert_equal ['botA', 'botB', 'botC'], params[:without]
    end

    should 'return empty whenever trying to parse params that do not exist' do
      params =  @@run_cmd.send( :extract_parameters, ['--wit=bot1,bot2,bot3', '-o=botA,botB,botC'] )
      assert_empty params[:with]
      assert_empty params[:without]
    end

  end

end
