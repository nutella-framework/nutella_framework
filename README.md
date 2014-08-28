
# Nutella [![Gem Version](https://badge.fury.io/rb/nutella_framework.svg)](http://badge.fury.io/rb/nutella_framework) [![Build Status](https://travis-ci.org/ltg-uic/nutella_framework.svg?branch=master)](https://travis-ci.org/ltg-uic/nutella_framework) [![Dependency Status](https://gemnasium.com/ltg-uic/nutella_framework.svg)](https://gemnasium.com/ltg-uic/nutella_framework) [![Code Climate](https://codeclimate.com/github/ltg-uic/nutella_framework/badges/gpa.svg)](https://codeclimate.com/github/ltg-uic/nutella_framework)
Nutella is a framework to build and run "Internet of Things"-like learning applications. It's still _very_ under development so keep an eye for new version and help fix the bugs you find by sumbmitting issues.

# Hello world
For a complete guide on how to use Nutella, please refer to [this wiki](https://github.com/ltg-uic/nutella/wiki).
You can install the most recent version of nutella with `gem install nutella_framework`. If all goes as expected you should be able to type `nutella` in your shell and get a welcome message. 

Nutella is written in ruby but is designed to run components written in virtually any  programming language. All communications among these components are routed through an  _MQTT broker_ which needs to be installed, together with its dependencies, before nutella can actually work correctly. Therefore **right after your install nutella** you should run the `nutella checkup` command.

# Building & contributing
Clone the repo, `bundle install` to take care of the dependencies and then `rake` to run all the tests. If you want to perform some fancier task simply type `rake -T` for a list of awesomeness.
