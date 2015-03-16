
[![Gem Version](https://badge.fury.io/rb/nutella_framework.svg)](http://badge.fury.io/rb/nutella_framework) 
[![Build Status](https://travis-ci.org/nutella-framework/nutella_framework.svg?branch=master)](https://travis-ci.org/nutella-framework/nutella_framework)
[![Code Climate](https://codeclimate.com/github/nutella-framework/nutella_framework/badges/gpa.svg)](https://codeclimate.com/github/nutella-framework/nutella_framework)

nutella is a framework to build and run RoomApps. It's still _very_ under development so any help [finding and fixing bugs](https://github.com/nutella-framework/nutella_framework/issues) will be greatly appreciated!

# Installing
Nutella is written in ruby but it leverages a bunch of other technologies that need to be installed. You will need:

1. _ruby_ (version >= 2.1.0). Do yourself a favor and use [RVM](https://rvm.io/rvm/install) to install Ruby.
1. _git_ (version >= 1.8.0). Do yourself a favor and use [Homebrew](http://brew.sh/) to install git, if you are on OSX.
1. _tmux_ (version >= 1.8.0). Do yourself a favor and use [Homebrew](http://brew.sh/) to install tmux, if you are on OSX.
1. _node.js_ (version >= 0.10.0). Yes, really, you need to install node becaue we use it to run the broker that handles all communications between all the pieces of the framework. Do yourself a favor and use [nvm](https://github.com/creationix/nvm).
1. _mongoDB_ (optional). You'll need mongoDB if you want to use it with `nutella.persist`.

Once you have all of these, to install nutella simply do:
```
gem install nutella_framework
```
Once the installation is complete you should be able to type `nutella` in your shell and get a welcome message. 

## nutella checkup
If you are reading this you probably already saw the warning: "Looks like this is a fresh installation of nutella. Please run 'nutella checkup' to check all dependencies are installed".

nutella is written in ruby but it's designed to run bots and interfaces written in virtually any programming language. All communications among these components are handled by an _MQTT broker_ which needs to be installed (together with its dependencies) before nutella can actually work correctly. Therefore **right after your install nutella** you should run:
```
nutella checkup
```
This will install the [Mosca](http://www.mosca.io/) MQTT broker and make sure all the dependencies required by nutella are installed as well.

Congratulations! nutella is ready to use!


# Where next?
If you already have an application you want to tinker with (like [RoomQuake](https://github.com/ltg-uic/roomquake)) simply checkout the application to a local folder, `cd /to/my/local/folder` and start tinkering away. Not sure how? Check out the [man page for the nutella command line tool](https://github.com/nutella-framework/nutella_framework/wiki).

If you want to create your own application, hold on tight, a tutorial is coming soon.


# Contributing
Check out our [contributing wiki page](https://github.com/nutella-framework/nutella_framework/wiki/Contributing)! Thanks!
