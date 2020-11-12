'use strict';
/**
 * SweetAlert wrapper
 * @doc https://github.com/oitozero/ngSweetAlert
 */
_app.factory('PopUp', ['SweetAlert', function(SweetAlert) {
  return {

    loading: function(_title) {
      SweetAlert.swal({
        title: _title,
        text: '<img src="img/loader.svg">',
        html: true,
        showCancelButton: false,
        showConfirmButton: false
      });
    },

    hide: function() {
      swal.close();
    },

    success: function(_title, _message, _cb) {
      SweetAlert.swal({
        title: _title,
        text: _message,
        type: 'success',
        showCancelButton: false,
        confirmButtonColor: '#54bbab',
        confirmButtonText: 'OK'
      }, _cb);
    },

    alert: function(_title, _message, _cb) {
      SweetAlert.swal({
        title: _title,
        text: _message,
        type: 'warning',
        showCancelButton: false,
        confirmButtonColor: '#54bbab',
        confirmButtonText: 'OK'
      }, _cb);
    },

    info: function(_title, _message) {
      SweetAlert.swal({
        title: _title,
        text: _message,
        type: 'info',
        showCancelButton: false,
        confirmButtonColor: '#54bbab',
        confirmButtonText: 'OK'
      });
    },

    confirm: function(_title, _message, _cb, _cancelButtonText, _confirmButtonText) {
      SweetAlert.swal({
            title: _title,
            text: _message,
            type: 'warning',
            showCancelButton: true,
            closeOnConfirm: false,
            cancelButtonText: _cancelButtonText || 'Cancelar',
            confirmButtonColor: '#438eb9',
            confirmButtonText: _confirmButtonText || 'OK'
          },
          _cb);
    },

    yesOrNo: function(_title, _message, _cb, _cancelButtonText, _confirmButtonText) {
      SweetAlert.swal({
            title: _title,
            text: _message,
            type: 'warning',
            showCancelButton: true,
            closeOnConfirm: false,
            closeOnCancel: false,
            cancelButtonText: _cancelButtonText || 'Não',
            confirmButtonColor: '#438eb9',
            confirmButtonText: _confirmButtonText || 'Sim'
          },
          _cb);
    },

    confirmWithInput: function(_title, _message, _inputType, _inputPlaceholder, _cb) {
      SweetAlert.swal({
        title: _title,
        text: _message,
        type: 'input',
        inputType: _inputType || 'text',
        showCancelButton: true,
        closeOnConfirm: false,
        confirmButtonColor: '#438eb9',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Finalizar',
        animation: 'slide-from-top',
        inputPlaceholder: _inputPlaceholder || ''
      }, function(inputValue) {

        if (inputValue === false) return false;

        if (inputValue === "") return false;

        try {
          inputValue = parseFloat( inputValue.replace(',', '.') );
        } catch(error) {
          return false;
        }

        _cb(inputValue);
      });
    }
  }
}]);

