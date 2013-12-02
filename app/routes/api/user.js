// Makes the async call to load the quote.
var http = require('http');
var https = require('https');
var _ = require('underscore-min');

var bibles = require('../lib/bibles');

exports.name = "bible-quote";
/**
The Bible API Aggregate Web Service brings together a number of Bible APIs on the web to offer a comprehensive set of Bibles to quote from. 
It offers REST-based APIs for looking up Bible passages.

Many thanks to the following services: [Biblia.com](http://api.biblia.com/docs/), [Bible Search](http://bibles.org/pages/api), [ESV Bible Web Service](http://www.esvapi.org/api), and [Bible.org](https://labs.bible.org/api_web_service)

@class bible-quote
**/
exports.remote = [ 
	{
		name: 'version.json', 
		method: 'get', 
		/**
		BibleQuote Handler for HTTP GET version.json.

		@method version.json
		@param version {String} One of the Bible ids listed in the {{#crossLink "bible-quote/versions.json:method"}}{{/crossLink}} call.
		@return {Object} JSON object describing the requested Bible version including id, title, copyright, and description.
		@example
			http://noblecall.orthlieb.com/api/bible-quote/version.json/?version=esv
		@example 
			{
				id: "esv",
				title: "English Standard Version",
				copyright: "Copyright 2001 by Crossway, a publishing ministry of Good News Publishers.",
				description: "The ESV Bible (English Standard Version) is an “essentially literal” translation of the Bible in contemporary English. The ESV Bible emphasizes “word-for-word” accuracy, literary excellence, and depth of meaning."
			}
		**/
		handler: function (req, res) {
			console.log('GET VERSION: ' + JSON.stringify(req.query));
			if (!bibles[req.query.version]) {
				res.send(400, "Bible version not valid (" + req.query.version + ")");
				return;
			}

			var version = _.pick(bibles[req.query.version], [ 'id', 'title', 'copyright', 'description' ]);
			res.json(200, version);
		}
	}