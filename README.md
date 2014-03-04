# Introduction
---
* What is Passboot? It is an [Express](http://expressjs.com/), [Passport](http://passportjs.org/), [Jade](http://jade-lang.com/), [Bootstrap](http://getbootstrap.com/), [Mongo](http://www.mongodb.org/), [Node](http://nodejs.org/) mashup.

* I was looking for a solution that I could use for simple username/password signup and login and social login. Passport is authentication middleware for node and has a variety plug-ins called strategies that perform the necessary setup and authentication for you. 

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
* Install the dependent modules with: `npm install` (a node_modules directory will be created locally)
* Copy appConfigTemplate.json to appConfig.json and edit the file appropriately. See [Configuration][Configuration] for more details.
    * `cd app/config`
    * `cp appConfigTemplate.json appConfig.json`
* `mongod` to start the Mongo database
* Start the server with: `grunt` and ensure that all is well
* You should now be able to see the demo at [http://localhost:3001](http://localhost:3001)

### Enabling Social Login
You will need to go to the various developer sites to register your application and get client ids and secrets for the social networks you want to support and add them to appConfig.json. You can obtain the necessary API keys here: [[Facebook](https://developers.facebook.com/docs/facebook-login/login-flow-for-web/), [LinkedIn](https://developer.linkedin.com/documents/authentication), [Twitter](https://dev.twitter.com/apps/new). GooglePlus does not currently need an API key/secret.

# Documentation
---
## Configuration
[Configuration]: In order to install, you will need to take appConfigTemplate.json and copy it to appConfig.json and populate it with your private and confidential data, like API keys.

There are number of useful configuration parameters that can be found in appConfig.json. These include keys for authentication of APIs like Facebook, Google, Twitter, and LinkedIn as well as feature flags to turn on and off features. The use of these configurations will be documented in the sample file included here.

You *should not* check this file into your sourcecode repository if your code is open source or otherwise available to the public as this will expose your API keys to the world.

### config.auth.*
Various authentication ids, client secrets, and callback URLs for Facebook, GooglePlus, Twitter, and Linkedin

### config.features.*
#### rememberMe
This will turn on/off the ability to allow the user to receive a cookie in order to keep them logged in.

#### checkboxCaptcha
This will turn on two things in the sign up page: a CSS hidden checkbox that should *never* be checked and a client-side generated checkbox that should always be checked. The value of the client-side checkbox is a server-generated one-time use token to prevent replay. See this [article](http://uxmovement.com/forms/captchas-vs-spambots-why-the-checkbox-captcha-wins) for why this is a good idea.

### config.mail.*
Mail service, authentication, and sender information for mail messages sent by the application.

### config.key.*
Various cookie, session, user, and token secrets. 

### config.url.*
URL snippets to go to various pages in the application. Good so that if you relocate something you don't need to recode in file.

### config.passwordOptions.*
See [complexify](https://github.com/danpalmer/jquery.complexify.js) by Dan Palmer for documentation and the node.js port [node-complexify](https://github.com/kislyuk/node-complexify) for the code.

Complexify's default settings will enforce a minimum level of complexity that would mean brute-forcing should take ~600 years on a commodity desktop machine (minimum 12 characters, minimum complexity of 49). The 'perfect' password used to scale the complexity percentage would take 3x10^33 years. These are equivalent to a 12 character password with uppercase, lowercase and numbers included, and a 25 character password with uppercase, lowercase, numbers and a wide range of punctuation. 

Complexity is calculated as follows: the *span* of a character is the number of characters in it's identified set. Sets are defined as clusters of unicode characters (uppercase, lowercase, numbers, punctuation, hiragana, etc.)

If *l* equals the length of your password and span(*k*) equals the *range* of the *k*th character in the password, then: 

$$complexity = {\log {(\sum\_{k=1}^l span(k))}^l}$$ 

Note that passboots complexity default settings are not as stringent (min: 8, complexity: 33).

#### minimumCharacters
Minimum number of characters to require for a password. Default is 8.

#### minimumComplexity
Minimum complexity to require for a password. See [complexify](https://github.com/danpalmer/jquery.complexify.js) for more details. Default is 33.

#### banMode
One of 'strict', 'loose', 'none'. Default is 'loose'.

* 'strict' will fail a password if it matches or is a substring of one of the passwords in the common password list.
* 'loose' will fail a password if it exactly matches one of the passwords in the common list.
* 'none' will implement no password checking.

## Flow Control
### app.use()
### Routing
The application uses a dynamic loader to load all routes from the routes folder. 

## Client-side Validation
* Passboot uses the [jQuery Validation Plugin](http://jqueryvalidation.org/) to perform client-side validation. There are validation APIs defined at http://<host>/user/valid and http://<host>/password/valid.

## Debugging
* Node Inspector
* mongodb

## Testing
* Mocha

# Release History
---
TODOs

* Change passport-local to something encrypted
* Create API to login to mirror web pages
* Use API keys
* Put password on the Mongo DB
* Timeout on logged in session

v2013-12-09

* First release (unstable)

## License
---

Licensed under the [MIT](http://opensource.org/licenses/MIT) license.

(The MIT License)

Copyright(c) 2014 Carl Orthlieb <github@orthlieb.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
