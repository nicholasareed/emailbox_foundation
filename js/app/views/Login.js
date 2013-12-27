define(function (require) {

	"use strict";

	var $                   = require('jquery'),
		_                   = require('underscore'),
		Backbone            = require('backbone'),
		bigtext             = require('bigtext'),

        Utils               = require('utils'),

		tpl                 = require('text!tpl/Login.html'),
		
		Handlebars          = require('handlebars-adapter'),
		template = Handlebars.compile(tpl);

	return Backbone.View.extend({

		initialize: function () {

	        // this.model = new models.User();

			this.render();
		},

		render: function () {
			var that = this;
			
			// Write html
			this.$el.html(template());

			// don't know why I need to wait...
			window.setTimeout(function(){
				that.$('.bigtext').bigtext();
				that.$('.bigtext').removeClass('hidden');
			},1);

			return this;
		},

		events: {
			'click .login-button' : 'login',
			'submit' : 'login',
		},

		login: function(ev){
			// Start OAuth process
			var that = this;

			var p = {
				app_id : App.Credentials.app_key,
				callback : [location.protocol, '//', location.host, location.pathname].join('')
			};
			
			if(App.Data.usePg){
				
				var p = {
					response_type: 'token', // token = "#", code = "?"
					client_id : App.Credentials.app_key,
					redirect_uri : 'https://getemailbox.com/testback'
				};
				var params = $.param(p);
				var call_url = App.Credentials.base_login_url + "/apps/authorize/?" + params;

				var ref = window.open(call_url, '_blank', 'location=yes');
				ref.addEventListener('loadstart', function(event) { 
					// event.url;
					var tmp_url = event.url;

					var parser = document.createElement('a');
					parser.href = tmp_url;

					if(parser.hostname == 'getemailbox.com' && parser.pathname.substr(0,9) == '/testback'){
						
						// window.plugins.childBrowser.close();
						// alert('closing childbrowser after /testback');
						// return false;
						// alert('testback');

						// url-decode
						// alert(tmp_url);
						var url = decodeURIComponent(tmp_url);
						// alert(url);

						// var qs = App.Utils.getUrlVars();
						var oauthParams = Utils.getOAuthParamsInUrl(url);
						// alert(JSON.stringify(oauthParams));

						// if(typeof qs.user_token == "string"){
						if(typeof oauthParams.access_token == "string"){

							// Have an access_token
							// - save it to localStorage

							// App.Utils.Storage.set(App.Credentials.prefix_access_token + 'user', oauthParams.user_identifier);
							// App.Utils.Storage.set(App.Credentials.prefix_access_token + 'access_token', oauthParams.access_token);

							Utils.Storage.set(App.Credentials.prefix_access_token + 'user', oauthParams.user_identifier, 'critical')
								.then(function(){
									// Saved user!
									// alert('saved user');
								});

							Utils.Storage.set(App.Credentials.prefix_access_token + 'access_token', oauthParams.access_token, 'critical')
								.then(function(){
									
									// Reload page, back to #home
									// forge.logging.info('reloading');

									// alert('success');
									// window.plugins.childBrowser.close();

									// Emit save event (write file)
									App.Events.trigger('FileSave',true);
									ref.close();


									// // Reload page, back to #home
									// window.location = [location.protocol, '//', location.host, location.pathname].join('');
									$('body').html('Loading');

									// Reload page, back to #home
									window.setTimeout(function(){
										window.location = [location.protocol, '//', location.host, location.pathname].join('');
									},500);
								});

						} else {
							// Show login splash screen
							var page = new App.Views.BodyLogin();
							App.router.showView('bodylogin',page);

							alert('Problem logging in');
							// window.plugins.childBrowser.close();
							ref.close();

						}

						return;

					}

					return;

				});
				// ref.addEventListener('loadstop', function(event) { alert('stop: ' + event.url); });
				// ref.addEventListener('loaderror', function(event) { console.error('Uh Oh, encountered an error: ' + event.message); });
				// ref.addEventListener('exit', function(event) { alert('exit1');alert(event.type); });

			} else {

				var p = {
					response_type: 'token',
					client_id : App.Credentials.app_key,
					redirect_uri : [location.protocol, '//', location.host, location.pathname].join('')
				};
				var params = $.param(p);
				window.location = App.Credentials.base_login_url + "/apps/authorize/?" + params;

			}

			return false;

		},

		login_old: function(ev){
			var that = this;

			var username = that.$('input#username').val(),
				password = that.$('input#password').val();

			this.$('.login-button').attr('disabled','disabled');

			$.ajaxSetup({
				headers: {
					'x-username' : username,
					'x-password' : password
				}
			});


			// Test fetching a user
			this.model.fetch({
				error: function(err){
					// invalid login

					alert('Failed logging in');
					that.$('.login-button').attr('disabled',false);

				},
				success: function(userModel){
					// Success logging in
					// - awesome!

					if(!userModel.get('_id')){
						// failed logging in]

						alert('Failed logging in (2)');
						that.$('.login-button').attr('disabled',false);

						return false;
					}

					// Store user in localStorage
					localStorage.setItem('user_v2_',JSON.stringify(userModel.toJSON()));

					// Set global logged in user
					App.Data.user = userModel;

					// Reload home
					Backbone.history.navigate('',{trigger: true});

					that.$('.login-button').attr('disabled',false);

				}

			});

			// $.ajax({
			// 	url: Credentials.server_root + 'login',
			// 	type: 'POST',
			// 	headers: {
			// 		'x-username': username,
			// 		'x-password': password
			// 	},
			// 	dataType: 'json',
			// 	error: function(result){
			// 		// failed
			// 		alert('Failed logging in');
					
			// 		that.$('.login-button').attr('disabled',false);
			// 	},
			// 	success: function(result){
			// 		if(result == true){
			// 			// Store login info in localstorage
			// 			localStorage.setItem('user_v1_',JSON.stringify({u:username,p:password}));

			// 			$.ajaxSetup({
			// 				headers: {
			// 					'x-username' : username,
			// 					'x-password' : password
			// 				}
			// 			});

			// 			// Reload home
			// 			Backbone.history.navigate('',{trigger: true});

			// 			that.$('.login-button').attr('disabled',false);

			// 		} else {
			// 			alert('Invalid login credentials');
			// 			that.$('.login-button').attr('disabled',false);
			// 		}
			// 	}
			// });

			ev.preventDefault();
			ev.stopPropagation();
			return false;

		}

	});

});