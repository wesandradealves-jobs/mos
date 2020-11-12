'use strict';

_app.service('Campaign', ['$http', 'AppConfig', function($http, AppConfig) {

    return {

    	create: function(campaign) {
  			return $http.post(AppConfig.resources.campaign.get, campaign);
  		},

      delete: function(campaignId) {
        return $http.delete(AppConfig.resources.campaign.get + '/' + campaignId);
      },

  		update: function(campaignId, campaign) {
  			return $http.put(AppConfig.resources.campaign.get + '/' + campaignId, campaign);
  		},

      getAll: function(type) {
        return $http.get(AppConfig.resources.campaign.get + '/type/' + type);
      },

      get: function(campaignId) {
        return $http.get(AppConfig.resources.campaign.get + '/' + campaignId);
      },

      getByMall: function(malls, type) {
        var mallsList = malls[0].id ? malls[0].id : "";
        for (var i=1; i < malls.length; i++)
          mallsList += "," + malls[i].id

        return $http.get(AppConfig.resources.campaign.get + '/type/' + type + '/mall/' + mallsList);
      },

/*
    getByStore: function(stores, type) {
      var storeList = stores[0].id ? stores[0].id : "";
      for (var i=1; i < stores.length; i++)
        storeList += "," + stores[i].id

      return $http.get(AppConfig.resources.campaign.get + '/type/' + type + '/mall/' + mallsList);
    },
*/

      findByName: function(campaignName) {
        return $http.get(AppConfig.resources.campaign.get + '/type/' + type + '/find/' + campaignName);
      },

  		publish: function(campaignId) {
  			return $http.post(AppConfig.resources.campaign.publish, {campaignId: campaignId});
  		},

  		previewBaseCut: function(params) {
  			return $http.post(AppConfig.resources.campaign.cutBase, params);
  		},

  		previewSelectChannel: function(params) {
  			return $http.post(AppConfig.resources.campaign.selectChannel, params);
  		},

  		getStoreTags: function() {
  			return $http.get(AppConfig.resources.campaign.storeTags);
  		},

  		getStoresByMall: function(mallId) {
  			return $http.get(AppConfig.resources.campaign.getStores + '/' + mallId );
  		},

  		//Charts
      getDailySales: function(campaignId) {
        return $http.get(AppConfig.resources.campaign.getDailySales + '?' +  'campaignId=' + campaignId);
  		},

  		getIndividualSales: function(campaignId) {
          return $http.get(AppConfig.resources.campaign.getIndividualSales + '?' +  'campaignId=' + campaignId);
      },

      getTotalDaily: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getTotaldaily + '?campaignId=' + campaignId );
  		},

  		getTotalSales: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getTotalSales + '?campaignId=' + campaignId );
  		},

  		getTotalAverageDailySales: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getTotalAverageDailySales + '?campaignId=' + campaignId );
			},
			
			getTotalTransactions: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getTotalAverageDailySales + '?campaignId=' + campaignId );
			},

  		getEmailFunnel: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getEmailFunnel + '?campaignId=' + campaignId );
  		},

  		getSmsFunnel: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getSmsFunnel + '?campaignId=' + campaignId );
  		},

  		getPushFunnel: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getPushFunnel + '?campaignId=' + campaignId );
  		},

  		getCampaignFunnel: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getCampaignFunnel + '?campaignId=' + campaignId );
			},

			getTotalTransactions: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getTotalTransactions + '?campaignId=' + campaignId );
			},

			getTotalClients: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getTotalClients + '?campaignId=' + campaignId );
			},

			getAverageTicketByClient: function(campaignId) {
  			return $http.get(AppConfig.resources.campaign.getAverageTicketByClient + '?campaignId=' + campaignId );
			}
    }

}]);
