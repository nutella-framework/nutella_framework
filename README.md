
[![Gem Version](https://badge.fury.io/rb/nutella_framework.svg)](http://badge.fury.io/rb/nutella_framework) 
[![Build Status](https://travis-ci.org/nutella-framework/nutella_framework.svg?branch=master)](https://travis-ci.org/nutella-framework/nutella_framework)

nutella is a framework to build and run Macroworlds. The original prototype was built as part of my dissertation and the code was hastly cobbled together at times. I have tried to cleanup over the years but please don't hate me if you find some skeletons. ☠️ If you want to help clean things up, give me a shout: help is greatly appreciated!

# Installing
nutella works on OSX and Linux (tested on Ubuntu) and it depends on a couple other things to work correctly. You will need:

1. _ruby_ (version >= 2.3.8). Do yourself a favor and use [RVM](https://rvm.io/rvm/install) to install Ruby.
1. _docker_ (version >= 17.03.0). If you are on OSX, do yourself a favor and use [Docker for mac](https://store.docker.com/editions/community/docker-ce-desktop-mac).
1. _git_ (version >= 1.8.0). Should come with the OS, nothing to do, yay!

Once you have all the nutella dependencies installed you can do:
```
gem install nutella_framework
```
You should then be able to type `nutella` in your shell and get a welcome message that looks like this

```
                   _       _ _
                  | |     | | |
       _ __  _   _| |_ ___| | | __ _
      |  _ \| | | | __/ _ \ | |/ _  |
      | | | | |_| | ||  __/ | | (_| |
      |_| |_|\__,_|\__\___|_|_|\__,_|

Welcome to nutella version 1.0.0! For a complete lists of available commands type 'nutella help'
Looks like this is a fresh installation of nutella. Please run 'nutella checkup' to check all dependencies are installed.
```

## nutella checkup
If you are reading this you probably already saw the warning: "Looks like this is a fresh installation of nutella. Please run `nutella checkup` to check all dependencies are installed correctly". **Please follow the prompt!**

```
nutella checkup
```
Congratulations! nutella is ready to use!


# Where next?
If you **already have an application** you want to tinker with (like [RoomQuake](https://github.com/ltg-uic/roomquake)) simply clone the application to your local folder of choice, `cd /to/my/local/folder` and start tinkering away. Not sure how? Check out the [docs](https://github.com/nutella-framework/docs)!

If you want to **create your first application** check out [this tutorial](https://github.com/nutella-framework/docs/blob/master/getting_started/tutorial_1.md).


# Contributing to nutella
Clone the repo, make sure you have [bundler](https://bundler.io/) installed, `bundle install` to take care of the dependencies, and then `rake` to run all the tests. If you want to build and install the gem just `rake install`. If you want a list of available build tasks, simply type `rake -T`. 

# nutella 2.0
In the summer of 2019, as a result of the feedback from nutella users (a.k.a. Tom), it became apparent to me that I needed to re-architect nutella into two separate components
1. A CLI that provided a way to interface with nutella
2. A "server" component that processes and executes the commands sent by either the CLI or other nutella components.

It also became clear I needed to improve the documentation of the nutella protocol and how it works in order to allow the expansion to more languages than the ones currently supported.

Work on nutella 2 can be tracked on [this project](https://github.com/orgs/nutella-framework/projects/2).