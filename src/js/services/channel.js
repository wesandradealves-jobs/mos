'use strict';

_app.service('Channel', ['$http', 'AppConfig', function($http, AppConfig) {

  return {

	  /* PUSH */
    createPush: function(push) {
			return $http.post(AppConfig.resources.channel.push, push);
		},

		getPush: function(pushId) {
			return $http.get(AppConfig.resources.channel.push + '/' + pushId);
		},

		updatePush: function(pushId, push) {
			return $http.put(AppConfig.resources.channel.push + '/' + pushId, push);
		},


		deletePush: function(campaignId, pushId) {
			return $http.delete(AppConfig.resources.channel.push + '/' + campaignId + '/' + pushId);
		},



		/* EMAIL */
		createEmail: function(email) {
			return $http.post(AppConfig.resources.channel.email, email);
		},

		getEmail: function(emailId) {
			return $http.get(AppConfig.resources.channel.email + '/' + emailId);
		},

		updateEmail: function(emailId, email) {
			return $http.put(AppConfig.resources.channel.email + '/' + emailId, email);
		},


		deleteEmail: function(campaignId, emailId) {
			return $http.delete(AppConfig.resources.channel.email + '/' + campaignId + '/' + emailId);
		},



		/* SMS */
		createSms: function(sms) {
			return $http.post(AppConfig.resources.channel.sms, sms);
		},

		getSms: function(smsId) {
			return $http.get(AppConfig.resources.channel.sms + '/' + smsId);
		},

		updateSms: function(smsId, sms) {
			return $http.put(AppConfig.resources.channel.sms + '/' + smsId, sms);
		},


		deleteSms: function(campaignId, smsId) {
			return $http.delete(AppConfig.resources.channel.sms + '/' + campaignId + '/' + smsId);
		},


		/* BANNER */
		previewBanner: function(banner) {
			return $http.post(AppConfig.resources.channel.banner, banner);
		},

    createBanner: function(banner) {
			return $http.post(AppConfig.resources.channel.banner, banner);
		},

		getBanner: function(bannerId) {
      const httpOptions = {
        headers: { 'Cache-Control': 'no-cache' }
      };
			return $http.get(AppConfig.resources.channel.banner + '/' + bannerId, httpOptions);
		},

		updateBanner: function(bannerId, banner) {
			return $http.put(AppConfig.resources.channel.banner + '/' + bannerId, banner);
		},

		deleteBanner: function(campaignId, bannerId) {
			return $http.delete(AppConfig.resources.channel.banner + '/' + campaignId + '/' + bannerId);
		},

    listOfferTypes: function () {
      return $http.get(AppConfig.resources.channel.banner + '/list/offer-types');
    },

    listSectionTypes: function () {
      return $http.get(AppConfig.resources.channel.banner + '/list/section-types');
    },


  }

}]);
