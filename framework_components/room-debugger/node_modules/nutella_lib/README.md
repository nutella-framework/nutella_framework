[![Build Status](https://travis-ci.org/nutella-framework/nutella_lib.js.svg?branch=master)](https://travis-ci.org/nutella-framework/nutella_lib.js)

# nutella library for node.js and the browser

## Installation
For node.js projects do
```
npm install nutella_lib
```

For browser projects either:

1. `npm install nutella_lib` and then use [browserify](http://browserify.org/) OR
2. use the bundled `nutella_lib.js` in `dist`


## Building the project
For developers working on the library. We are using gulp + browserify + watchify to continuously and incrementally build the library as we develop. 

**To contribute**: Clone the repo and `gulp bundle` inside the project directory. Every time you make a change to any of the files required by the library gulp will rebuild it. 


## Releasing a new version
For developers working on the library, to release a new version:

1. Update the version in `package.json` and `src/version.js` 
1. Run gulp to generate distribution for the browser
1. Commit
1. Tag version (`git tag -a vx.y.z -m 'A message'`) and push tag (`git push origin --tags`)
1. Publish to npm (`npm publish`)
