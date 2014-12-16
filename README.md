
[![Gem Version](https://badge.fury.io/rb/nutella_framework.svg)](http://badge.fury.io/rb/nutella_framework) 
[![Build Status](https://travis-ci.org/nutella-framework/nutella_framework.svg?branch=master)](https://travis-ci.org/nutella-framework/nutella_framework) 
[![Dependency Status](https://gemnasium.com/nutella-framework/nutella_framework.svg)](https://gemnasium.com/nutella-framework/nutella_framework) 
[![Code Climate](https://codeclimate.com/github/nutella-framework/nutella_framework/badges/gpa.svg)](https://codeclimate.com/github/nutella-framework/nutella_framework)

# Nutella 
Nutella is a framework to build and run ClassroomStories. It's still _very_ under development so any help [finding and fixing bugs](https://github.com/nutella-framework/nutella_framework/issues) will be greatly appreciated!

# Installing
Nutella is written in ruby but it leverages lots of technologies that already exists. Therefore, before you can successfully install nutella, you need to install (if you don't have them already):

1. _ruby_ (version >= 2.1.0). Do yourself a favor and use [RVM](https://rvm.io/rvm/install).
1. _git_ (version >= 1.8.0). Do yourself a favor and use [Homebrew](http://brew.sh/) if you are on OSX.
1. _tmux_ (version >= 1.8.0). Do yourself a favor and use [Homebrew](http://brew.sh/) if you are on OSX.
1. _node.js_ (version >= 0.10.0). Yes, really, you need to install node becaue we use it to run the broker that handles all communications between all the pieces of the framework. Do yourself a favor and use [nvm](https://github.com/creationix/nvm).

Once you have all the pieces that you need, to install nutella simply do:
```
gem install nutella_framework
```
Once the installation is complete you should be able to type `nutella` in your shell and get a welcome message. 

## nutella checkup
If you are reading this you probably already saw the warning: "Looks like this is a fresh installation of nutella. Please run 'nutella checkup' to check all dependencies are installed".

Nutella is written in ruby but is designed to run bots and interfaces written in virtually any programming language. All communications among these components are routed through an _MQTT broker_ which needs to be installed (together with its dependencies) before nutella can actually work correctly. Therefore **right after your install nutella** you should run: 
```
nutella checkup
```
This will install the [Mosca](http://www.mosca.io/) MQTT broker and make sure all the dependencies required by nutella are installed as well.

Congratulations! Nutella is ready to use!


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
