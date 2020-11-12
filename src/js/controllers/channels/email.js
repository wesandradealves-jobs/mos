'use strict';

/* global _app, grapesjs, axios */
/* eslint-env browser */
/* eslint semi: off */

//email (
//  id SERIAL NOT NULL PRIMARY KEY,
//  subject VARCHAR(150) NOT NULL,
//  content VARCHAR NOT NULL,
//  create_date TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
//  send_after TIMESTAMP WITHOUT TIME ZONE,
//  description VARCHAR(500)
//);
_app.controller('EmailController', [
  '$scope', 'PopUp', 'AppConfig', 'Channel', 'Utils', 'EventBus',
  function ($scope, PopUp, AppConfig, Channel, Utils, EventBus) {
    const params = $scope.dialogParams;
    const uploadEndpoint = AppConfig.resources.channel.imageUpload;
    $scope.editor = null;

    $scope.editorStyle = "* { box-sizing: border-box; } body {margin: 0;}";
    $scope.editorComponents = "";

    const generateHTML = function () {
      // const savedHTML = $scope.editor.getHtml();
      const savedHTML = $scope.editor.runCommand('gjs-get-inlined-html');
      const savedCSS = $scope.editor.getCss();

      return `<style>${savedCSS}</style><!------>${savedHTML}`;
    };

    const splitHTML = function (content) {
      const elements = content.split('<!------>');
      const css = elements[0].replace('<style>', '').replace('</style>', '');

      return {
        css: css,
        html: elements[1]
      };
    };

    const postImage = function (file) {
      const deferred = Utils.defer();
      const fileReader = new FileReader();
      fileReader.readAsBinaryString(file);

      fileReader.onload = function (event) {
        const base64image = btoa(event.target.result);

        const payload = {
          file: {
            name: file.name,
            type: file.type,
            content: base64image
          }
        };

        axios.post(uploadEndpoint, payload)
        .then(function (response) {
          $scope.editor.AssetManager.add(response.body || response.data);
          $scope.editor.AssetManager.render();
          deferred.resolve(true);
        }).catch(function (reason) {
          deferred.reject(reason);
          console.log(reason);
        });
      };

      return deferred.promise;
    };

    const uploadImageFiles = function (e) {
      PopUp.loading('Carregando imagens...');
      const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
      const promises = [];
      for (let index = 0; index < files.length; index += 1) {
        promises.push(postImage(files[index]));
      }

      Promise.all(promises).then(function () {
        PopUp.hide();
      }).catch(function (reason) {
        console.log(reason);
        PopUp.alert('O carregamento de imagens falhou!');
      });
    };

const defaultSectionBlock = `<section>
<h1>This is a simple title</h1>
<div>This is just a Lorem text: Lorem ipsum dolor sit amet</div>
</section>`;

    const close = function () {
      $scope.closeThisDialog({ emailId: $scope.email.id });
      // value: {val1: 10, val2: 500, val3: "Yeah!"} -> função $scope.closeThisDialog()
      // value: "$document" -> clicou fora
      // value: "$closeButton" -> clicou no botão de fechar
      // value: "$escape" -> clicou no esc
    };

    const createEditor = function (alreadyCreated) {
      const fromElement = !alreadyCreated;

      $scope.editor = grapesjs.init({
          forceClass: false,
          autorender: 0,
          container: '#gjs',
          fromElement: fromElement, // take the content directly from div id=gjs
          style: $scope.editorStyle,
          components: $scope.editorComponents,
          css: $scope.editorStyle,
          html: $scope.editorComponents,
          // --- Size of the editor ---
          height: '400px',
          width: 'auto',
          settings: true,
          storageManager: {
            type: null,
            autosave: false,
            autoload: false,
          },
          plugins: ['grapesjs-preset-newsletter'],
          // blockManager: {
          //   // appendTo: '#blocks',
          //   blocks: [
          //     {
          //         id: 'section', // id is mandatory
          //         label: '<b>Section</b>', // You can use HTML/SVG inside labels
          //         attributes: { class: 'gjs-fonts gjs-f-b1' },
          //         content: defaultSectionBlock,
          //         select: false,
          //         activate: false,
          //     }, {
          //         id: 'text',
          //         label: 'Text',
          //         attributes: { class: 'gjs-fonts gjs-f-text' },
          //         content: '<div data-gjs-type="text">Insert your text here</div>',
          //         select: false,
          //         activate: false,
          //     }, {
          //         id: 'image',
          //         attributes: { class: 'gjs-fonts gjs-f-image' },
          //         label: 'Image',
          //         select: true,
          //         content: { type: 'image' },
          //         activate: true,
          //     }
          //   ]
          // },
          assetManager: {
            noAssets: 'Nenhuma imagem carregada, arraste e solte arquivos aqui.',
            credentials: 'omit',
            headers: { },
            assets: [ ],
            multiUpload: true,
            autoAdd: 1,
            uploadText: 'Solte arquivos aqui ou clique em <b>Carregar imagem</b>.',
            addBtnText: 'Carregar imagem',
            // dropzone: 1, // dropzone na tela todam atrapalha quando temos outras coisas
            dropzoneContent: '<div class="dropzone-inner">Solte aqui seus arquivos.</div>',
            // openAssetOnDrop: 1,
            uploadFile: uploadImageFiles, // função
            handleAdd: '', // função
            inputPlaceholder: 'https://endereco/da/imagem.jpg',
            modalTitle: 'Selecionar imagem'
         },
      });

      $scope.editor.Panels.removeButton("views", "open-layers");
      $scope.editor.Panels.removeButton("options", "export-template");

      $scope.editor.on('asset:upload:error', console.log);
      $scope.editor.on('asset:upload:response', console.log);
      $scope.editor.on('storage:store', console.log);
      $scope.editor.on('storage:error', console.log);
      $scope.editor.on('storage:load', console.log);

      if (alreadyCreated) {
        $scope.editor.setComponents($scope.editorComponents);
        $scope.editor.setStyle($scope.editorStyle);
      }

      // hack/workaround to wait for the editor to be ready
      setImmediate(function () {
        $scope.editor.render();
      });
    };

    const loadEmail = function () {
      const deferred = Utils.defer();

      PopUp.loading(AppConfig.messages.channel.email.loading);

      Channel.getEmail(params.emailId || '-1').success(function (_email) {
        if (!_email) {
          deferred.resolve(false);
          PopUp.hide();
          return;
        }

        $scope.email = _email;

        PopUp.hide();
        deferred.resolve(_email.content);
      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.email.title,
          AppConfig.messages.apiGenericError);

        console.log(error);
        deferred.reject(error);
      });

      return deferred.promise;
    };

    $scope.createEmail = function () {
      PopUp.loading(AppConfig.messages.channel.email.creating);

      $scope.email.content = generateHTML();
      Channel.createEmail($scope.email)
      .success(function (fetchedEmail) {
        $scope.email = fetchedEmail;

        PopUp.success(AppConfig.messages.channel.email.title,
          AppConfig.messages.channel.email.success, close);
      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.email.title,
          AppConfig.messages.apiGenericError);

        console.log(error);
      });

    };

    $scope.updateEmail = function() {
      PopUp.loading(AppConfig.messages.channel.email.updating);

      $scope.email.content = generateHTML();
      Channel.updateEmail($scope.email.id, $scope.email)
      .success(function (fetchedEmail) {
        $scope.email = fetchedEmail;

        PopUp.success(AppConfig.messages.channel.email.title,
          AppConfig.messages.channel.email.success, close);
      }).error(function (error) {
        PopUp.alert(AppConfig.messages.channel.email.title,
          AppConfig.messages.apiGenericError);
        console.log(error);
      });
    };

    $scope.deleteEmail = function () {
      PopUp.confirm(
        AppConfig.messages.channel.email.title,
        AppConfig.messages.channel.email.deleteMsg,
        function (resp) {
          if (!resp) {
            PopUp.hide();
            return;
          }

          PopUp.loading(AppConfig.messages.channel.email.deleting);

          Channel.deleteEmail(params.email.campaignId, $scope.email.id)
          .success(function () {
            $scope.email = {};

            PopUp.success(AppConfig.messages.channel.email.title,
              AppConfig.messages.channel.email.success, function () {
                // não importa o controlador origem/pai, o evento vai ser
                // enviado pra quem estiver ouvindo...
                EventBus.publish('flash-reload-flash-list', {});
                EventBus.publish('campaign-reload-campaign-list', {});
                close();
              });

          }).error(function (error) {
            PopUp.alert(
              AppConfig.messages.channel.email.title,
              AppConfig.messages.apiGenericError
            );

            console.log(error);
          });
        }
      );
    };

    $scope.mode = params.mode;
    $scope.email = {};
    $scope.editorStyle = "* { box-sizing: border-box; } body {margin: 0;}";
    $scope.editorComponents = "";
    $scope.subjectError = false;
    $scope.validateSubject = function () {
      $scope.subjectError = !$scope.email.subject;
    };

    console.log(params.mode);

    // if (params.mode != 'CREATE') {
      //params.emailId;
      loadEmail().then(function (content) {
        if (!content) {
          throw Error('No such content!'); // enters catch block
        }

        const result = splitHTML(content);
        // console.log(result);
        $scope.editorStyle = result.css;
        $scope.editorComponents = result.html;

        createEditor(true);
      }).catch(function () {
        $scope.editorStyle = "* { box-sizing: border-box; } body {margin: 0;}";
        $scope.editorComponents = "";

        createEditor(true);
      });
    // } else {
      // Promise.resolve(true).then(function () {


        // createEditor(true);
      // });
    // }
}]);
