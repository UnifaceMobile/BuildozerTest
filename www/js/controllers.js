// String starts with polyfill
if (!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function(searchString, position) {
			position = position || 0;
			return this.lastIndexOf(searchString, position) === position;
		}
	});
}



angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $translate, myHelper) {
	// Form data for the browser modal
	$scope.browserData = {};

	$scope.browserData.url = undefined;

	$scope.reset = function() {
		$scope.browserData.url = null;
	}

	$scope.goDisable = function() {
		return !localStorage.getItem("lastUrls") || localStorage.getItem("lastUrls") == "null";
	};

	// Perform the goto action when the user submits the goto form
	$scope.goTo = function() {
		console.log('Doing submit', $scope.browserData.url);

		cordova.plugins.Keyboard.close();

		var url = $scope.browserData.url;

		myHelper.goTo(url);
	};

	$scope.scanme = function() {
		cordova.plugins.barcodeScanner.scan(
			function(result) {
				if (result.cancelled) {
					//if it is cancelled, show an hidden alert to work around the back button issue
					//ref http://marsbomber.com/2014/05/29/BarcodeScanner-With-Ionic/ 
					$ionicModal.fromTemplate('').show().then(function() {
						$ionicPopup.alert({
							title: 'QR Scan Cancelled',
							template: 'You cancelled it!'
						});
					});
				} else {
					var url = result.text;
					myHelper.goTo(url);
				}
			},
			function(error) {
				alert("Scanning failed: " + error);
			}
		);
	}

	$scope.reload = function() {
		var lastUrls = localStorage.getItem("lastUrls");
		if (lastUrls !== undefined || lastUrls !== null) {
			var history_list = JSON.parse(localStorage.getItem("lastUrls"));

			var url = history_list[history_list.length - 1];

			myHelper.goTo(url);
		}
	}
})

.controller('SettingsCtrl', function($scope, $stateParams, $translate) {

	$translate('CACHE_CLEARED').then(function(translatedValue) {
		$scope.cacheCleared = translatedValue;
	});

	$translate('HISTORY_CLEARED').then(function(translatedValue) {
		$scope.historyCleared = translatedValue;
	});

	$scope.clearCache = function() {
		var error = function(status) {
			console.log('Error: ' + status);
		}

		var success = function(status) {
			window.plugins.toast.showShortBottom($scope.cacheCleared, function(a) {
				console.log('toast success: ' + a)
			}, function(b) {
				alert('toast error: ' + b)
			});
		}

		window.cache.clear(success, error);

	};

	$scope.clearHistory = function() {
		localStorage.setItem("lastUrls", null);
		if (JSON.parse(localStorage.getItem("lastUrls")) === null) {
			window.plugins.toast.showLongBottom($scope.historyCleared, function(a) {
				console.log('toast success: ' + a)
			}, function(b) {
				alert('toast error: ' + b)
			});
		}
	};
})

.controller('HistoryCtrl', function($scope, $stateParams, myHelper) {
	$scope.items = [];
	var history_list = JSON.parse(localStorage.getItem("lastUrls"));

	if (history_list && history_list.length > 0) {
		history_list = history_list.filter(function onlyUnique(value, index, self) {
			return self.indexOf(value) === index;
		});

		//revert array
		history_list = history_list.reverse();

		for (var i = 0; i < history_list.length; i++) {
			$scope.items.push({
				id: history_list[i]
			});
		}
	}

	$scope.goTo = function(url) {
		myHelper.goTo(url);
	}
});
