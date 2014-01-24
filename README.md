Passboot
========

![Passboot icon](./app/public/ico/Passboot.png)
# Introduction
---
* What is Passboot? It is an Express, Passport, Jade, Bootstrap, Mongo, Node mashup.
* I was looking for a solution that I could use for simple username/password signup and login and social login. [Passport](http://passportjs.org/) is authentication middleware for node and has a variety plug-ins called strategies that perform the necessary setup and authentication for you. 
* What was missing was a good example and UI to get me started. Hence the birth of Passboot.

## Getting Started

* Open up a terminal command line window
* Install [NodeJS](http://nodejs.org/) and NPM (globally)
* Install [Grunt](https://github.com/gruntjs/grunt-cli) (globally) `npm install -g grunt-cli`
* Install [MongoDB](http://www.mongodb.com/)
* cd to the directory you want to install passboot into
	* `cd <parent directory>`
	* `git clone https://github.com/orthlieb/passboot.git`
	* `cd passboot`
* Install the dependent modules with: `npm install` (locally a node_modules directory will be created)
* `mongod` to start the Mongo database
* Start the server with: `grunt` and ensure that all is well
* You should now be able to see the demo at [http://localhost:3001](http://localhost:3001)
### Enabling Social Login
* Need to get API keys for the various networks and add them appConfig.json

# Documentation
---
## Configuration
In order to install, you will need to take appConfigTemplate.json and copy it to appConfig.json and populate it with your private and confidential data, like API keys.

There are number of useful configuration parameters that can be found in appConfig.json. These include keys for authentication of APIs like Facebook, Google, Twitter, and LinkedIn as well as feature flags to turn on and off features. The use of these configurations will be documented in the sample file included here.

You *should not* check this file into your sourcecode repository if your code is open source or otherwise available to the public as this will expose your API keys to the world.

### config.auth.*
Various authentication ids, client secrets, and callback URLs for Facebook, GooglePlus, Twitter, and Linkedin

### config.features.*
#### remember_me
This will turn on/off the ability to allow the user to receive a cookie in order to keep them logged in.

#### checkbox_captcha
This will turn on two things in the sign up page: a CSS hidden checkbox that should *never* be checked and a client-side generated checkbox that should always be checked. The value of the client-side checkbox is a server-generated one-time use token to prevent replay. See this [article](http://uxmovement.com/forms/captchas-vs-spambots-why-the-checkbox-captcha-wins) for why this is a good idea.

### config.mail.*
Mail service, authentication, and sender information for mail messages sent by the application.

### config.key.*
Various cookie, session, user, and token secrets. 

### config.url.*
URL snippets to go to various pages in the application. Good so that if you relocate something you don't need to recode in file.


## Flow Control
### app.use()
### Routing

## Client-side Validation
* [jQuery Validation Plugin](http://jqueryvalidation.org/)

## Debugging
* Node Inspector
* mongodb

# Release History
---
TODOs

* Change passport-local to something encrypted
* Add forgot password/username workflow
* Create API to login to mirror web pages
* Use API keys
* Add documentation to the main page
* Put password on the Mongo DB
* Timeout on logged in session


v2013-12-09

* First release (unstable)

## License
---

Licensed under the [MIT](http://opensource.org/licenses/MIT) license.

(The MIT License)

Copyright(c) 2013 Carl Orthlieb <github@orthlieb.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
