// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'pascalprecht.translate', 'ngIOS9UIWebViewPatch'])

.config(function($ionicConfigProvider) {
	$ionicConfigProvider.navBar.alignTitle('center');
})

.config(function($stateProvider, $urlRouterProvider, $compileProvider) {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);
})

//set up the language translation
.config(function($translateProvider) {
	for (lang in translations) {
		$translateProvider.translations(lang, translations[lang]);
	}

	$translateProvider.registerAvailableLanguageKeys(['en', 'nl', 'pt', 'ja', 'zh-Hans', 'zh-Hant', 'de', 'fr', 'es', 'it'], {
		'de-*': 'de',
		'fr-*': 'fr',
		'en-*': 'en',
		'nl-*': 'nl',
		'ja-*': 'ja',
		'pt-*': 'pt',
		'zh-CN': 'zh-Hans',
		'zh-HK': 'zh-Hant',
		'zh-TW': 'zh-Hant',
		'zh': 'zh-Hans',
		'es-*': 'es',
		'it-*': 'it'

	});

	$translateProvider.preferredLanguage('en').fallbackLanguage('en');
})

.run(function($ionicPlatform, $translate, $state) {
	$ionicPlatform.ready(function() {

		//override the hardware backbutton logic, if 
		$ionicPlatform.registerBackButtonAction(function(e) {
			if ($state.is('app.home')) {
				// exit app
				console.log('exit!');
				ionic.Platform.exitApp();
				return false;
			} else if ($state.is('app.about') || $state.is('app.browse') || $state.is('app.history') || $state.is('app.settings') || $state.is('app.menu')) {
				window.location = "index.html";
				return false;
			}
		}, 100);

		// set the l10n base on the device default language
		if (typeof navigator.globalization !== "undefined") {
			navigator.globalization.getPreferredLanguage(function(language) {
				$translate.use(language.value).then(function(data) {
					console.log("SUCCESS -> " + data);
				}, function(error) {
					console.log("ERROR -> " + error);
				});
			}, null);
		}

		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}

		screen.lockOrientation('portrait-primary');
	});
})

.config(function($stateProvider, $urlRouterProvider) {
	$stateProvider

	.state('app', {
		url: "/app",
		abstract: true,
		templateUrl: "templates/menu.html",
		controller: 'AppCtrl'
	})

	.state('app.home', {
		url: "/home",
		views: {
			'menuContent': {
				templateUrl: "templates/home.html",
			}
		}
	})

	.state('app.browse', {
		cache: false,
		url: "/browse",
		views: {
			'menuContent': {
				templateUrl: "templates/browse.html",
			}
		}
	})

	.state('app.history', {
		url: "/history",
		views: {
			'menuContent': {
				templateUrl: "templates/history.html",
				controller: 'HistoryCtrl'
			}
		}
	})

	.state('app.settings', {
		url: "/settings",
		views: {
			'menuContent': {
				templateUrl: "templates/settings.html",
				controller: 'SettingsCtrl'
			}
		}
	})

	.state('app.about', {
		url: "/about",
		views: {
			'menuContent': {
				templateUrl: "templates/about.html"
			}
		}
	});
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
})

.factory('myHelper', function($http, $translate) {
	return {
		scanme: function() {
			cordova.plugins.barcodeScanner.scan(
				function(result) {

					var url = result.text;

					if (result.cancelled) {
						//if it is cancelled, do nothing.
					} else {
						this.goTo(url)
					}
				},
				function(error) {
					alert("Scanning failed: " + error);
				}
			);
		},

		goTo: function(url) {
			var msg_invalidUrl;

			$translate('INVALID_URL').then(function(translatedValue) {
				msg_invalidUrl = translatedValue;
			});

			if (url) {
				//hide keyboard
				cordova.plugins.Keyboard.close();
				//blur out the focus
				ionic.DomUtil.blurAll();

				// add http:// by default if the schema is not part of URL
				if (!url.startsWith("http://") && !url.startsWith("https://")) {
					url = "http://" + url;
				}

				$http({
					method: 'GET',
					url: url
				}).then(function successCallback(response) {
					//validate url connection
					if (response.status == 200) {
						//unlock orientation
						screen.unlockOrientation();

						//if web storage is supported, save the lastUrl into localStorage.
						if (typeof(Storage) !== "undefined") {
							var history_list = JSON.parse(localStorage.getItem("lastUrls")) || [];
							history_list.push(url);
							if (url) {
								localStorage.setItem("lastUrls", JSON.stringify(history_list));
							}
						} else {
							//Current do nothing
						}

						//load url
						window.location = url;
					} else {
						window.plugins.toast.showShortBottom(msg_invalidUrl, function(a) {
							console.log('toast success: ' + a)
						}, function(b) {
							alert('toast error: ' + b)
						});
					}
				}, function errorCallback(response) {
					window.plugins.toast.showShortBottom(msg_invalidUrl, function(a) {
						console.log('toast success: ' + a)
					}, function(b) {
						alert('toast error: ' + b)
					});
				});
			} else {
				console.log("Please enter a URL");
			}
		},

		isEmpty: function(val) {
			return (val === undefined || val == null || val.length <= 0 || val == "null") ? true : false;
		}
	};
});
