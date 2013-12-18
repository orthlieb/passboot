'use strict';

var _ = require('underscore');
var mongoose = require('mongoose'),
	LocalStrategy = require('passport-local').Strategy,
	RememberMeStrategy = require('passport-remember-me').Strategy,
	FacebookStrategy = require('passport-facebook').Strategy,
	TwitterStrategy = require('passport-twitter').Strategy,
	GoogleStrategy = require('passport-google').Strategy,
	LinkedInStrategy = require('passport-linkedin').Strategy,
	User = mongoose.model('User'),
	Token = mongoose.model('Token');

module.exports = function (passport, config) {

    passport.serializeUser(function(user, done) {
    	if (_.isArray(user)) 
    		user = user[0];
    	console.log('**** Serialize user: ' + JSON.stringify(user));
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
    	console.log('**** Deserialize user id: ' + id);
 		User.findOne({ id: id }, function (err, user) {
   			console.log('Found user: ' + JSON.stringify(user));
			done(err, user);
		});
	});

	// Local XXX Replace with non clear password submit
  	passport.use(new LocalStrategy({
		usernameField: 'id',
		passwordField: 'password'
	},
	function(id, password, done) {
		User.isValidUserPassword(id, password, function (err, user) {
			if (err) return done(false, null);
			return done(false, user);
		});
	}));
	
	// Remember me
	if (config.features.remember_me) {
		passport.use(new RememberMeStrategy(
			function(token, done) {
				// Consumes the token and finds the associated user.
				Token.consume(token, function (err, uid) {
					if (err) { return done(err, uid); }
					User.findOne({ id: uid }, function (err, user) {
						if (!user) { return done('notfound', { type: 'error', message: 'Remember Me: user id not found' }); }
						return done(null, user);
					});
				});
			},
			function(user, done) {
				// Creates a new one-time token associated with this user.
				Token.save(user.id, done);
			}
		));
	}
	
	// Facebook
	passport.use(new FacebookStrategy({
			clientID: config.auth.facebook.clientID,
			clientSecret: config.auth.facebook.clientSecret,
			callbackURL: config.auth.facebook.callbackURL
		},
        function(accessToken, refreshToken, profile, done) {
			// {
			//    'id':'599426715',
			//    'username':'carl.orthlieb',
			//    'displayName':'Carl Orthlieb',
			//    'name':{
			//       'familyName':'Orthlieb',
			//       'givenName':'Carl'
			//    },
			//    'gender':'male',
			//    'profileUrl':'https://www.facebook.com/carl.orthlieb',
			//    'emails':[
			//       {
			//          'value':'facebook@orthlieb.com'
			//       }
			//    ],
			//    'provider':'facebook',
			//    '_raw':'{\'id\':\'599426715\',\'name\':\'Carl Orthlieb\',\'first_name\':\'Carl\',\'last_name\':\'Orthlieb\',\'link\':\'https:\\/\\/www.facebook.com\\/carl.orthlieb\',\'username\':\'carl.orthlieb\',\'work\':[{\'employer\':{\'id\':\'108514639427\',\'name\':\'WhiteHat Security\'},\'location\':{\'id\':\'105464892820215\',\'name\':\'Santa Clara, California\'},\'position\':{\'id\':\'148940488456489\',\'name\':\'Vice President of Engineering\'},\'start_date\':\'0000-00\'}],\'education\':[{\'school\':{\'id\':\'106453629390528\',\'name\':\'Dr. E.P. Scarlett High School\'},\'type\':\'High School\'},{\'school\':{\'id\':\'103773232995164\',\'name\':\'University of Waterloo\'},\'concentration\':[{\'id\':\'104076956295773\',\'name\':\'Computer Science\'},{\'id\':\'109807242372242\',\'name\':\'Systems Engineering\'}],\'type\':\'College\'}],\'gender\':\'male\',\'email\':\'facebook\\u0040orthlieb.com\',\'timezone\':-7,\'locale\':\'en_US\',\'verified\':true,\'updated_time\':\'2013-10-15T22:14:24+0000\'}',
			//    '_json':{
			//       'id':'599426715',
			//       'name':'Carl Orthlieb',
			//       'first_name':'Carl',
			//       'last_name':'Orthlieb',
			//       'link':'https://www.facebook.com/carl.orthlieb',
			//       'username':'carl.orthlieb',
			//       'work':[ ... ],
			//       'education':[ ... ],
			//       'gender':'male',
			//       'email':'facebook@orthlieb.com',
			//       'timezone':-7,
			//       'locale':'en_US',
			//       'verified':true,
			//       'updated_time':'2013-10-15T22:14:24+0000'
			//    }
			// }        	
			var data = {
				provider:		profile.provider,
				id:				profile.provider + ':' + profile.id, 
				familyName: 	profile.name.familyName,
				givenName:		profile.name.givenName,
				displayName:	profile.displayName,
				email:			profile.emails[0].value,
//				photo:			
				json:			JSON.stringify(profile._json),
				gender:			profile.gender,
        	};
        	      	
        	User.socialLogin(data, done);
        }
    ));
    
    // Google
	passport.use(new GoogleStrategy({
			returnURL: config.auth.google.returnURL,
			realm: config.auth.google.realm
		},
		function(id, profile, done) {
			// profile = {
			//    'displayName':'Carl Orthlieb',
			//    'emails':[
			//       {
			//          'value':'orthlieb@gmail.com'
			//       }
			//    ],
			//    'name':{
			//       'familyName':'Orthlieb',
			//       'givenName':'Carl'
			//    }
			// }			
			var data = {
				provider:		'google',
				id:				'google:' + profile.emails[0].value, 
				familyName: 	profile.name.familyName,
				givenName: 		profile.name.givenName,
				displayName: 	profile.displayName,
				email: 			profile.emails[0].value,
//				photo:			
				json:			JSON.stringify(profile),
//				gender:
			};
			User.socialLogin(data, done);	
		}
	));
	
	// Twitter
	passport.use(new TwitterStrategy({
			consumerKey: config.auth.twitter.consumerKey,
			consumerSecret: config.auth.twitter.consumerSecret,
			callbackURL: config.auth.twitter.callbackURL
		},
        function(accessToken, refreshToken, profile, done) {
			//	{
			//    'id':'16669373',
			//    'username':'orthlieb',
			//    'displayName':'Carl Orthlieb',
			//    'photos':[
			//       {
			//          'value':'https://si0.twimg.com/profile_images/378800000385819486/b91c18e367da5cdb09fada122c38003c_normal.jpeg'
			//       }
			//    ],
			//    'provider':'twitter',
			//    '_raw':'{\'id\':16669373,\'id_str\':\'16669373\',\'name\':\'Carl Orthlieb\',\'screen_name\':\'orthlieb\',\'location\':\'Santa Clara, CA\',\'description\':\'Vice President of Engineering, WhiteHat Security Inc.\',\'url\':\'http:\\/\\/t.co\\/hlSPqXh3UQ\',\'entities\':{\'url\':{\'urls\':[{\'url\':\'http:\\/\\/t.co\\/hlSPqXh3UQ\',\'expanded_url\':\'http:\\/\\/www.whitehatsec.com\',\'display_url\':\'whitehatsec.com\',\'indices\':[0,22]}]},\'description\':{\'urls\':[]}},\'protected\':false,\'followers_count\':185,\'friends_count\':72,\'listed_count\':7,\'created_at\':\'Thu Oct 09 17:14:41 +0000 2008\',\'favourites_count\':65,\'utc_offset\':-25200,\'time_zone\':\'Pacific Time (US & Canada)\',\'geo_enabled\':true,\'verified\':false,\'statuses_count\':515,\'lang\':\'en\',\'status\':{\'created_at\':\'Tue Oct 15 21:11:50 +0000 2013\',\'id\':390223514466516993,\'id_str\':\'390223514466516993\',\'text\':\'WhiteHat Security is looking for Django Architect. We're the good guys! Ethical hacking -&gt; web se...\\nhttp:\\/\\/t.co\\/CwiZqBUkEk #job\',\'source\':\'\\u003ca href=\\\'http:\\/\\/jobvite.com\\\' rel=\\\'nofollow\\\'\\u003eJobvite\\u003c\\/a\\u003e\',\'truncated\':false,\'in_reply_to_status_id\':null,\'in_reply_to_status_id_str\':null,\'in_reply_to_user_id\':null,\'in_reply_to_user_id_str\':null,\'in_reply_to_screen_name\':null,\'geo\':null,\'coordinates\':null,\'place\':null,\'contributors\':null,\'retweet_count\':0,\'favorite_count\':0,\'entities\':{\'hashtags\':[{\'text\':\'job\',\'indices\':[127,131]}],\'symbols\':[],\'urls\':[{\'url\':\'http:\\/\\/t.co\\/CwiZqBUkEk\',\'expanded_url\':\'http:\\/\\/jobvite.com\\/m?3h7N6gw2\',\'display_url\':\'jobvite.com\\/m?3h7N6gw2\',\'indices\':[104,126]}],\'user_mentions\':[]},\'favorited\':false,\'retweeted\':false,\'possibly_sensitive\':false,\'lang\':\'en\'},\'contributors_enabled\':false,\'is_translator\':false,\'profile_background_color\':\'1A1B1F\',\'profile_background_image_url\':\'http:\\/\\/abs.twimg.com\\/images\\/themes\\/theme9\\/bg.gif\',\'profile_background_image_url_https\':\'https:\\/\\/abs.twimg.com\\/images\\/themes\\/theme9\\/bg.gif\',\'profile_background_tile\':false,\'profile_image_url\':\'http:\\/\\/a0.twimg.com\\/profile_images\\/378800000385819486\\/b91c18e367da5cdb09fada122c38003c_normal.jpeg\',\'profile_image_url_https\':\'https:\\/\\/si0.twimg.com\\/profile_images\\/378800000385819486\\/b91c18e367da5cdb09fada122c38003c_normal.jpeg\',\'profile_banner_url\':\'https:\\/\\/pbs.twimg.com\\/profile_banners\\/16669373\\/1379116007\',\'profile_link_color\':\'2FC2EF\',\'profile_sidebar_border_color\':\'181A1E\',\'profile_sidebar_fill_color\':\'252429\',\'profile_text_color\':\'666666\',\'profile_use_background_image\':true,\'default_profile\':false,\'default_profile_image\':false,\'following\':false,\'follow_request_sent\':false,\'notifications\':false}',
			//    '_json':{
			//       'id':16669373,
			//       'id_str':'16669373',
			//       'name':'Carl Orthlieb',
			//       'screen_name':'orthlieb',
			//       'location':'Santa Clara, CA',
			//       'description':'Vice President of Engineering, WhiteHat Security Inc.',
			//       'url':'http://t.co/hlSPqXh3UQ',
			//       ...
			//    }
			// }    
			var data = {
				provider:		profile.provider,
				id:				profile.provider + ':' + profile.id, 
//				familyName: 
//				givenName: 
				displayName: 	profile.displayName,
//				email: 
				photo: 			profile.photos[0].value,
				json: 			JSON.stringify(profile._json),
//				gender:				
			};    
            User.socialLogin(data, done);
        }
    ));	
    
	// LinkedIn
	passport.use(new LinkedInStrategy({
			consumerKey: config.auth.linkedin.consumerKey,
			consumerSecret: config.auth.linkedin.consumerSecret,
			callbackURL: config.auth.linkedin.callbackURL
		},
		function(token, tokenSecret, profile, done) {
			// {
			// 	'provider':'linkedin',
			// 	'id':'112xdbcpHt',
			// 	'displayName':'Carl Orthlieb',
			// 	'name':{
			// 	'familyName':'Orthlieb',
			// 	'givenName':'Carl'
			// },
			// '_raw':'{\n  \'firstName\': \'Carl\',\n  \'id\': \'112xdbcpHt\',\n  \'lastName\': \'Orthlieb\'\n}',
			// '_json':{
			// 	'firstName':'Carl',
			// 	'id':'112xdbcpHt',
			// 	'lastName':'Orthlieb'
			// }
			var data = {
				provider:		profile.provider,
				id:				profile.provider + ':' + profile.id, 
  				familyName: 	profile.name.familyName,
  				givenName: 		profile.name.givenName,
				displayName: 	profile.displayName,
//				email: 
//				id: profile.username,
//				photo: profile.photos[0].value,
				json: JSON.stringify(profile._json),
//				gender:				
			};
			User.socialLogin(data, done);
		}
	));
}
