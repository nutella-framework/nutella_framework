require 'helper'

module Nutella

  class TestCmdCLIParamsParsing < MiniTest::Test

    def setup
      @run_cmd = RunCommand.new
    end


    should 'parse app long argument' do
      params =  @run_cmd.parse_cli_parameters ['--with=bot1,bot2,bot3']
      assert_equal %w(bot1 bot2 bot3), params[:with]
    end

    should 'parse without long argument' do
      params =  @run_cmd.parse_cli_parameters ['--without=botA,botB,botC']
      assert_equal %w(botA botB botC), params[:without]
    end

    should 'parse with long argument' do
      params =  @run_cmd.parse_cli_parameters ['--with=botX,botY,botZ']
      assert_equal %w(botX botY botZ), params[:with]
    end

    should 'parse one short argument' do
      params =  @run_cmd.parse_cli_parameters ['-w=bot1,bot2,bot3']
      assert_equal %w(bot1 bot2 bot3), params[:with]
    end

    should 'parse two long arguments' do
      params =  @run_cmd.parse_cli_parameters %w(--with=bot1,bot2,bot3 --without=botA,botB,botC)
      assert_equal %w(bot1 bot2 bot3), params[:with]
      assert_equal %w(botA botB botC), params[:without]
    end

    should 'parse two short arguments' do
      params =  @run_cmd.parse_cli_parameters %w(-wo=bot1,bot2,bot3 -w=botA,botB,botC)
      assert_equal %w(bot1 bot2 bot3), params[:without]
      assert_equal %w(botA botB botC), params[:with]
    end

    should 'parse one short and one long argument' do
      params =  @run_cmd.parse_cli_parameters %w(--with=bot1,bot2,bot3 -wo=botA,botB,botC)
      assert_equal %w(bot1 bot2 bot3), params[:with]
      assert_equal %w(botA botB botC), params[:without]
    end

    should 'raise an exception when trying to parse params that do not exist' do
      assert_raises (StandardError) { @run_cmd.parse_cli_parameters %w(--wit=bot1,bot2,bot3 -o=botA,botB,botC) }
    end

  end

end