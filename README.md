Passboot
========

![Passboot icon](./app/public/ico/Passboot.png)
# Introduction

* What is Passboot? It is an Express, Passport, Jade, Bootstrap, Node mashup.
* I was looking for a solution that I could use for simple username/password signup and login and social login. [Passport](http://passportjs.org/) is authentication middleware for node and has a variety plug-ins called strategies that perform the necessary setup and authentication for you. 
* What was missing was a good example and UI to get me started. Hence the birth of Passboot.

## Getting Started

* Install [NodeJS](http://nodejs.org/) and NPM (globally)
* Install [Grunt](https://github.com/gruntjs/grunt-cli) (globally) `npm install -g grunt-cli`
* Install [MongoDB](http://www.mongodb.com/)
* `git clone https://github.com/orthlieb/passboot.git`
* `cd passboot`
* Install the dependent modules with: `npm install` (locally, a node_modules directory will be created)
* `mongod`
* Start the server with: `grunt`
* You should now be able to see the demo at localhost:3001

# Documentation

* TBD

# Release History

TODOs

* Change passport-local to something encrypted
* Add forgot password/username workflow
* Create API to login to mirror web pages
* Add documentation to the main page

v2013-12-09

* First release

## License

Licensed under the [MIT](http://opensource.org/licenses/MIT) license.
