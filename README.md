
[![Gem Version](https://badge.fury.io/rb/nutella_framework.svg)](http://badge.fury.io/rb/nutella_framework) 
[![Build Status](https://travis-ci.org/nutella-framework/nutella_framework.svg?branch=master)](https://travis-ci.org/nutella-framework/nutella_framework) 
[![Dependency Status](https://gemnasium.com/nutella-framework/nutella_framework.svg)](https://gemnasium.com/nutella-framework/nutella_framework) 
[![Code Climate](https://codeclimate.com/github/nutella-framework/nutella_framework/badges/gpa.svg)](https://codeclimate.com/github/nutella-framework/nutella_framework)

# Nutella 
Nutella is a framework to build and run "Internet of Things"-like learning applications. It's still _very_ under development so keep an eye on new versions and help fix the bugs you find by [submitting issues](https://waffle.io/nutella-framework/nutella_framework). Nutella's goal is to be for the "Internet of Things" what Ruby on Rails has been for web applications. Ambitious? You bet, but where is the fun if the challenge is trivial?

# Installing
Nutella is a ruby gem so to install it we do:
```
gem install nutella_framework
```
If all goes as expected you should be able to type `nutella` in your shell and get a welcome message (yay!) together with a warnining (booooo!). Let's see why...

Nutella is written in ruby but is designed to run bots and interfaces written in virtually any programming language. All communications among these components are routed through an _MQTT broker_ which needs to be installed (together with its dependencies) before nutella can actually work correctly. Therefore **right after your install nutella** you should run: 
```
nutella checkup
```
in order to make sure all the dependencies have been correctly installed.


# Hello world
So what does nutella do for me? Suppose we want to create a new application called "crepe" (because I like nutella crêpes). Let's do that:
```
nutella new crepe
```
Nutella will create the basic project structure in a directory called `crepe`. Now that we have created a basic project, we can 
```
cd crepe
``` 
and start our new project by doing
```
nutella start
```
Pretty boring isn't it? Nothing is happeninig! Why? Well, because the project we just created is simply an empty shell. Let's spice things up a bit and throw some cinnamon into this crêpe!

## Templates
What are templates? Templates are simply [boilerplate code](http://en.wikipedia.org/wiki/Boilerplate_code) that you don't have to write.  Templates are there to simplify your life. Let's see how. Our new application is a ...
**This tutorial is a work in progress**


For a complete guide on how to use Nutella, please refer to [this wiki](https://github.com/nutella-framework/nutella_framework/wiki).

# Building & contributing
Clone the repo, `bundle install` to take care of the dependencies and then `rake` to run all the tests. If you want to perform some fancier task simply type `rake -T` for a list of awesomeness.
