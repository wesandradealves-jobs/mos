'use strict';

/* global _app */
/* eslint
  semi: off,
  comma-dangle: off */

_app.factory('AppConfig', ['Environment', (Environment) => {
  const __ENV = Environment.env;
  const ENV_LABEL = {
    'prod': 'mos',
    'staging': 'staging',
    'dev': 'dev',
    'demo': 'demo',
    'localhost': 'http://localhost:3001',
  };

  const API_URL = {
    'prod': 'https://api.spotmetrics.com:4501',
    'staging': 'https://staging.spotmetrics.com:4501',
    'dev': 'https://dev.spotmetrics.com:4501',
    'demo': 'https://demo.spotmetrics.com:4501',
    'localhost': 'http://localhost:4500',
  };

  const MOS2_URL = {
    'prod': 'https://api.spotmetrics.com:3001',
    'staging': 'https://staging.spotmetrics.com:3001',
    'demo': 'https://demo.spotmetrics.com:3001',
    //'dev': 'https://dev.spotmetrics.com:3001',
    'dev': 'http://localhost:3001',
  };

  //TODO melhorar essa condicional para a url do app não ser localhost apenas quando usa a API em dev
  //deve ser localhost sempre que estiver rodando localmente, independentemente da origem da API
  const appUrl = (__ENV === 'dev') ? 'http://localhost:3000/' : `https://${ENV_LABEL}.spotmetrics.com/`;

  return {
    applicationCode: '1edb3cef-88cd-4b57-adeb-97fa4027a7b9',

    version: '1.4.0',
    env: __ENV,
    envLabel: ENV_LABEL[__ENV],

    appUrl: appUrl,

    originRegistry: {
      BABYCARE: "FRALDARIO",
      CUSTOMERSERVICE: "SAC",
      VIPLOUNGE: "SALA VIP",
    },

    resources: {

      mos2: {
        url: MOS2_URL[ __ENV ],
        sac: MOS2_URL[ __ENV ] + '/sac',
        emailBuilder: MOS2_URL[ __ENV ] + '/emailBuilder',
        emprestimo: MOS2_URL[ __ENV ] + '/emprestimo',
        register: MOS2_URL[ __ENV ] + '/register',
        coalition: MOS2_URL[ __ENV ] + '/coalition',
        storekeeper: MOS2_URL[ __ENV ] + '/storekeeper',
        loan: MOS2_URL[ __ENV ] + '/loan',
        lostfound: MOS2_URL[ __ENV ] + '/lostfound',
      },

      login: API_URL[ __ENV ] + '/api/employee-mall/login',

      clientMall: {
        getClientMall: API_URL[ __ENV ] + '/api/client-mall',
        sendClubAcceptance: API_URL[ __ENV ] + '/api/client-mall/club-acceptance/send',
        getBestClient: API_URL[ __ENV ] + '/api/client-mall/best-client',
        updateTargeting: API_URL[ __ENV ] + '/api/client-mall',
      },

      customerView: {
        getClientByCpf: API_URL[ __ENV ] + '/api/client',
        getClientByCpfMall: API_URL[ __ENV ] + '/api/client',
        getClientByNameAndCpf: API_URL[ __ENV ] + '/api/client/search',
        getRegistrationData: API_URL[ __ENV ] + '/api/customer-view/registration-data',
        getEngagementData: API_URL[ __ENV ] + '/api/customer-view/engagement-data',
        getPurchaseBySegment: API_URL[ __ENV ] + '/api/customer-view/purchase-by-segment',
        getEventsPropension: API_URL[ __ENV ] + '/api/customer-view/events-propension',
        getTopStores: API_URL[ __ENV ] + '/api/customer-view/top-stores',
        getTopStoresAlike: API_URL[ __ENV ] + '/api/customer-view/top-stores-alike',
        getBuyerProfile: API_URL[ __ENV ] + '/api/customer-view/buyer-profile',
        getAppUse: API_URL[ __ENV ] + '/api/customer-view/app-use',
        getFacilitiesUse: API_URL[ __ENV ] + '/api/customer-view/facility-use',
        getSpending: API_URL[ __ENV ] + '/api/customer-view/spending',
        getTransactionalData: API_URL[ __ENV ] + '/api/customer-view/transactional-data',
      },

      inmallView: {
        getBaseView: API_URL[ __ENV ] + '/api/inmall-view/base-view',
        getStoreSpending: API_URL[ __ENV ] + '/api/inmall-view/store-spending',
        getWeeklyAppInteractions: API_URL[ __ENV ] + '/api/inmall-view/weekly-app-interactions',
        getAppInteractions: API_URL[ __ENV ] + '/api/inmall-view/app-interactions-by-day',
        getFacilitiesUse: API_URL[ __ENV ] + '/api/inmall-view/facilities-usage',
        getMixedMetrics: API_URL[ __ENV ] + '/api/inmall-view/mixed-metrics',
        getModalityFlow: API_URL[ __ENV ] + '/api/inmall-view/modality-flow',
        getNewSignup: API_URL[ __ENV ] + '/api/inmall-view/daily-new-signup-by-origin',
        getDailySpending: API_URL[ __ENV ] + '/api/inmall-view/daily-spending'
      },

      customerService: {
        get: API_URL[ __ENV ] + '/api/customer-service',
        getCustomerServiceReason: API_URL[ __ENV ] + '/api/customer-service-reason',
        systemChannels: API_URL[ __ENV ] + '/api/system-channels/sac',
        getDailyAttendance: API_URL[ __ENV ] + '/api/customer-service/graphics/daily-attendance',
        getStatusFlow: API_URL[ __ENV ] + '/api/customer-service/graphics/customer-service-status-flow',
        getAttendanceReason: API_URL[ __ENV ] + '/api/customer-service/graphics/attendance-reason-view',
        getWeeklyAttendance: API_URL[ __ENV ] + '/api/customer-service/graphics/weekly-attendance-by-type',
        getAttendanceScore: API_URL[ __ENV ] + '/api/customer-service/graphics/attendance-score-comparation',
        getAverageScore: API_URL[ __ENV ] + '/api/customer-service/graphics/average-score'
      },

      vipLounge: {
        get: API_URL[ __ENV ] + '/api/vip-lounge/online',
        exit: API_URL[ __ENV ] + '/api/vip-lounge/exit',
        enter: API_URL[ __ENV ] + '/api/vip-lounge/enter',
        canAccess: API_URL[ __ENV ] + '/api/vip-lounge/can-access',
        getVisits: API_URL[ __ENV ] + '/api/vip-lounge/graphics/visits/stacked',
        getVisitsOnly: API_URL[ __ENV ] + '/api/vip-lounge/graphics/visits/heatmap',
        getRecurrence: API_URL[ __ENV ] + '/api/vip-lounge/graphics/recurrence',
        getPermanence: API_URL[ __ENV ] + '/api/vip-lounge/graphics/permanence/extent',
        getAverageConsumption: API_URL[ __ENV ] + '/api/vip-lounge/graphics/average-consumption',
        getLower: API_URL[ __ENV ] + '/api/vip-lounge/graphics/permanence/lower',
        getHigher: API_URL[ __ENV ] + '/api/vip-lounge/graphics/permanence/higher',
        getMean: API_URL[ __ENV ] + '/api/vip-lounge/graphics/permanence/mean',
        getAutoForced: API_URL[ __ENV ] + '/api/vip-lounge/graphics/auto-forced-exits'
      },

      babyCare: {
        get: API_URL[ __ENV ] + '/api/babycare/visit',
        getActivities: API_URL[ __ENV ] + '/api/babycare/activities',
        getUsages: API_URL[ __ENV ] + '/api/babycare/usages',
        getVisitsByDay: API_URL[ __ENV ] + '/api/babycare/graphics/visits/bars',
        getCategories: API_URL[ __ENV ] + '/api/babycare/graphics/categories/pizza',
        getVisits: API_URL[ __ENV ] + '/api/babycare/graphics/visits/heatmap',
        getRecurrence: API_URL[ __ENV ] + '/api/babycare/graphics/recurrence',
        getConversions: API_URL[ __ENV ] + '/api/babycare/graphics/conversions',
        getAverageConsumption: API_URL[ __ENV ] + '/api/babycare/graphics/average-consumption'
      },

      mallPromotion: {
        promotionTypes: API_URL[ __ENV ] + '/api/mall-promotion-types',
        promotionLabels: API_URL[ __ENV ] + '/api/mall-promotion-labels',
        newPromotion: API_URL[ __ENV ] + '/api/mall-promotion/new',
        getPromotions: API_URL[ __ENV ] + '/api/mall-promotion',
        promotion: API_URL[ __ENV ] + '/api/mall-promotion',
      },

      mallPromotionGraphics: {
        totalRaffleTickets: API_URL[ __ENV ] + '/api/mall-promotion-graphics/total-raffle-tickets',
        totalClients: API_URL[ __ENV ] + '/api/mall-promotion-graphics/total-clients',
        averageClientTicket: API_URL[ __ENV ] + '/api/mall-promotion-graphics/average-ticket-by-client',
        averageTxTicket: API_URL[ __ENV ] + '/api/mall-promotion-graphics/average-ticket-by-transaction',
        totalPurchase: API_URL[ __ENV ] + '/api/mall-promotion-graphics/total-purchase',
        crossedChartsView: API_URL[ __ENV ] + '/api/mall-promotion-graphics/crossed-charts-view',
        getPromotionPerformance: API_URL[ __ENV ] + '/api/mall-promotion-graphics/promotion-performance',
        salesPerStore: API_URL[ __ENV ] + '/api/mall-promotion-graphics/sales-per-store',
        totalDailySales: API_URL[ __ENV ] + '/api/mall-promotion-graphics/total-daily-sales',
        totalTransactions: API_URL[ __ENV ] + '/api/mall-promotion-graphics/total-transactions',
      },

      settings: {
        getStoresByMall: API_URL[ __ENV ] + '/api/store/mall',
        getStore: API_URL[ __ENV ] + '/api/store',
        getEmployeeMall: API_URL[ __ENV ] + '/api/employee-mall/mall',
        getEmployee: API_URL[ __ENV ] + '/api/employee-mall',
        getMccActivities: API_URL[ __ENV ] + '/api/mcc/activity',
        getRole: API_URL[ __ENV ] + '/api/employee-mall-role',
        getRolesByMall: API_URL[ __ENV ] + '/api/employee-mall-role/mall',
        getPermissions: API_URL[ __ENV ] + '/api/mall-role-permission',
        getSegments: API_URL[ __ENV ] + '/api/segments/get-activities',
        getSegmentsByMall: API_URL[ __ENV ] + '/api/client-targeting/mall',
        setSegments: API_URL[ __ENV ] + '/api/client-targeting/all',
      },

      channel: {
        push: API_URL[ __ENV ] + '/api/channels/push',
        email: API_URL[ __ENV ] + '/api/channels/email',
        sms: API_URL[ __ENV ] + '/api/channels/sms',
        banner: API_URL[ __ENV ] + '/api/channels/banner',
        imageUpload: API_URL[ __ENV ] + '/api/channels/email/upload-image',
      },

      campaign: {
        get: API_URL[ __ENV ] + '/api/campaign',
        publish: API_URL[ __ENV ] + '/api/campaign/publish',
        cutBase: API_URL[ __ENV ] + '/api/campaign/base-cut/preview',
        selectChannel: API_URL[ __ENV ] + '/api/campaign/select-channel/preview',
        storeTags: API_URL[ __ENV ] + '/api/store-tags',
        getStores: API_URL[ __ENV ] + '/api/store/mall',
        getTotaldaily: API_URL[ __ENV ] + '/api/campaign/graphics/total-daily-sales',
        getDailySales: API_URL[ __ENV ] + '/api/campaign/graphics/total-daily-sales',
        getIndividualSales: API_URL[ __ENV ] + '/api/campaign/graphics/individual-sales',
        getTotalSales: API_URL[ __ENV ] + '/api/campaign/reports/total-sales',
        getTotalAverageDailySales: API_URL[ __ENV ] + '/api/campaign/reports/total-average-daily-sales',
        getEmailFunnel: API_URL[ __ENV ] + '/api/campaign/graphics/email-funnel',
        getSmsFunnel: API_URL[ __ENV ] + '/api/campaign/graphics/sms-funnel',
        getPushFunnel: API_URL[ __ENV ] + '/api/campaign/graphics/push-funnel',
        getCampaignFunnel: API_URL[ __ENV ] + '/api/campaign/graphics/campaign-funnel',
        getTotalTransactions: API_URL[ __ENV ] + '/api/campaign/reports/total-transactions',
        getTotalClients: API_URL[ __ENV ] + '/api/campaign/reports/total-clients',
        getAverageTicketByClient: API_URL[ __ENV ] + '/api/campaign/reports/average-ticket-by-client',
      },

      client: {
        get: API_URL[ __ENV ] + '/api/client'
      },

      coupon: {
        pendents: API_URL[ __ENV ] + '/api/client/points/pendent/malls',
        images: API_URL[ __ENV ] + '/api/client/points',
        lastApproveds: API_URL[ __ENV ] + '/api/client/points/last-approveds',
        byClient: API_URL[ __ENV ] + '/api/client/points/all/:clientId/malls/:mallIds',
        pointReason: API_URL[ __ENV ] + '/api/client-point-reason/',
      },

      instoreView: {
        getClient: API_URL[ __ENV ] + '/api/instore-view/graphics/get-client-recurrence',
        getAverageTicket: API_URL[ __ENV ] + '/api/instore-view/graphics/get-average-ticket',
        getSelling: API_URL[ __ENV ] + '/api/instore-view/graphics/get-total-transactions-value',
        getTotalUniqueClients: API_URL[ __ENV ] + '/api/instore-view/reports/get-unique-clients',
        getTransactionQuantity: API_URL[ __ENV ] + '/api/instore-view/reports/get-transaction-quantity',
        getTransactionValue: API_URL[ __ENV ] + '/api/instore-view/reports/get-total-transactions-value',
        getStores: API_URL[ __ENV ] + '/api/store/search',
        getStoreTransactions: API_URL[ __ENV ] + '/api/instore-view/graphics/get-transaction-quantity',
        getTopStore: API_URL[ __ENV ] + '/api/store/best-store',
      },

    },

    messages: {

      loading: 'Loading Data...',
      apiGenericError: 'Ocorreu um problema durante o processamento!',
      apiEasterEggError: 'Sorry, something went wrong. A team of highly trained monkeys has been dispatched to deal with this situation.',

      discardFormChanges: {
        title: 'Dados não salvos!',
        subtitle: 'Se você mudar de aba agora, irá perder seus dados do formulário. Deseja continuar?'
      },

      promotion: {
        title: 'Promoção',
        creating: 'Criando...',
        failedCreating: 'Não foi possível criar a promoção!',
        failedCreatingOldDate: 'Não foi possível criar a promoção! As datas de início e fim devem estar no futuro!',
        failedCreatingHigherSinceDate: 'Não foi possível criar a promoção! A data inicial deve ser anterior à data final!',
        success: 'Sua requisição foi feita com sucesso!',
        excluded: 'Sua promoção foi apagada com sucesso!',
        failedExclusion: 'Não foi possível apagar a promoção.',
        confirmExclusion: 'Deseja realmente apagar?',
        failedEdition: 'Não foi possível salvar a promoção.',
        failedPublished: 'Não foi possível publicar a promoção.',
        failedPublishDraw: 'Não foi possível publicar promoção.',
        confirmRedeem: 'O cliente deseja mesmo retirar o brinde?'
      },

      flash: {
        title: 'Flash',
        creating: 'Criando...',
        deleting: 'Apagando...',
        publishing: 'Publicando...',
        success: 'Sua requisição foi feita com sucesso!',
      },

      login: {
        validating: 'Validando login...',
        invalidData: 'Dados inválidos'
      },

      customerView: {
        title: 'Customer View',
        clientNotFound: 'Cliente não encontrado!',
        updateSuccess: 'Cliente atualizado com sucesso!'
      },

      campaign: {
        title: 'Campanha',
        creating: 'Criando...',
        publishing: 'Publicando...',
        success: 'Sua requisição foi feita com sucesso!',
        deleting: 'Excluindo...',
        deleted: 'Campanha excluída com sucesso!'
      },

      customerService: {
        title: 'SAC',
        creating: 'Criando...',
        success: 'Sua requisição foi feita com sucesso!'
      },

      vipLounge: {
        title: 'Sala VIP',
        creating: 'Criando...',
        entering: 'Entrando...',
        success: 'Sua requisição foi feita com sucesso!',
        askToRemove: 'O cliente saiu da sala VIP?',
        removing: 'Saindo...',
        removed: 'Cliente saiu da sala VIP!',
        errorWhileRemoving: 'Erro ao tentar sair da sala VIP!',
        notAccess: 'Cliente não tem acesso a sala VIP!',
        clubAcceptanceFalse: 'Cliente não pertence ao clube',
        clientStillOnVIPLounge: 'Cliente ainda não saiu da sala VIP',
        monthlyLimitReached: 'Cliente já atingiu limite mensal',
        unknownErrorCode: 'Código de erro desconhecido'
      },

      babyCare: {
        title: 'Fraldário',
        creating: 'Criando...',
        success: 'Sua requisição foi feita com sucesso!'
      },

      channel: {
        sms: {
          title: 'SMS',
          creating: 'Criando...',
          updating: 'Atualizando...',
          deleting: 'Apagando...',
          loading: 'Carregando...',
          deleteMsg: 'Deseja realmente apagar?',
          success: 'Sua requisição foi feita com sucesso!'
        },
        email: {
          title: 'Email',
          creating: 'Criando...',
          updating: 'Atualizando...',
          deleting: 'Apagando...',
          loading: 'Carregando...',
          deleteMsg: 'Deseja realmente apagar?',
          success: 'Sua requisição foi feita com sucesso!'
        },
        push: {
          title: 'Push',
          creating: 'Criando...',
          updating: 'Atualizando...',
          deleting: 'Apagando...',
          loading: 'Carregando...',
          deleteMsg: 'Deseja realmente apagar?',
          success: 'Sua requisição foi feita com sucesso!'
        },
        banner: {
          title: 'Banner',
          creating: 'Criando...',
          updating: 'Atualizando...',
          deleting: 'Apagando...',
          loading: 'Carregando...',
          deleteMsg: 'Deseja realmente apagar?',
          success: 'Sua requisição foi feita com sucesso!'
        },
      },
      coupon: {
        title: {
          plural: 'Cupons',
          singular: 'Cupom'
        },
        gettingImages: 'Obtendo cupons...',
        gettingPendents: 'Obtendo cupons pendentes...',
        errorWhileGetting: 'Erro ao obter cupons pendentes!',
        errorWhileGettingImages: 'Erro ao obter imagens!',
        errorWhileGettingApproveds: 'Erro ao obter histórico!',
        updating: 'Atualizando cupom...',
        errorWhileUpdating: 'Não foi possível atualizar o cupom!',
        updated: 'Cupom atualizado!',
      },
      settings: {
        stores: {
          title: 'Configuração de Lojas',
          creating: 'Criando...'
        },
        segment: {
          title: 'Configuração',
          deleteMsgTitle: 'Excluir Segmento',
          deleteMsg: 'Deseja realmente apagar?',
        },
        employee: {
          title: 'Cadastro de Operador',
          creating: 'Criando...',
          success: 'Sua requisição foi feita com sucesso!',
        },
        role: {
          title: 'Configuração de Papeis',
          deleteMsgTitle: 'Excluir Papel',
          deleteMsg: 'Deseja realmente apagar?',
        },
        userControl: {
          title: 'Excluir todos os cpfs',
          deleteMsgTitle: 'Excluir tudo?',
          deleteMsg: 'Deseja realmente excluir todos os CPF\'s cadastrados?',
        },
        userControlDelete: {
          title: 'Excluir todos os cpfs',
          deleteMsgTitle: 'Excluir CPF?',
          deleteMsg: 'Deseja realmente excluir o CPF?',
        },
      },
    }
  }
}]);
