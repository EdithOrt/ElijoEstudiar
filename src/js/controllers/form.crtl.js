pmb_im.controllers.controller('FormCtrl', ['$scope', '$state',
  '$stateParams',
  '$ionicPlatform',
  '$ionicPopup',
  'LocationsService',
  'ApiService',
  'MapService',
  'DBService',
  '$ionicSlideBoxDelegate',
  '$ionicScrollDelegate',
  function($scope, $state, $stateParams, $ionicPlatform, $ionicPopup, LocationsService, ApiService, MapService, DBService, $ionicSlideBoxDelegate,
  $ionicScrollDelegate) {

    $scope.form = {};
    $scope.form.edad = 16;
    $scope.form.ultimo_nivel_aprobado = "primaria";
    $scope.form.ultimo_anio_aprobado = "";
    $scope.form.plan = "";
    //$scope.form.lugar = "";
    $scope.form.depto = "";
    $scope.form.localidad = "";
    $scope.form.que = "";
    $scope.form.donde = {};
    $scope.form.turnos = {
      "matutino":1,
      "vespertino":1,
      "nocturno":1
    };
    $scope.form.SearchQueResults = {};
    $scope.form.SearchDondeResults = {};
    $scope.form.searchQue = "";
    $scope.form.searchDonde = "";
    $scope.form.option = "list";
    $scope.establecimientos = null;

    $scope.restarEdad = function(){
      if(parseInt($scope.form.edad) > 4){
        $scope.form.edad = parseInt($scope.form.edad) - 1;
      }
    };

    $scope.sumarEdad = function(){
      $scope.form.edad = parseInt($scope.form.edad) + 1;
    };

    $scope.selectUltimoNivel = function(idNivel){
      var x = document.getElementsByClassName("nivel");
      var i;
      for (i = 0; i < x.length; i++) {
          x[i].className = "nivel_"+x[i].id +" nivel hidden";
          x[i].childNodes[1].style.display = "block";
          x[i].childNodes[3].style.display = "none";
      }
      var selected = document.getElementById(idNivel);
      selected.className = "nivel_"+selected.id +" nivel";
      selected.childNodes[1].style.display = "none";
      selected.childNodes[3].style.display = "block";
      $scope.form.ultimo_nivel_aprobado = idNivel;
    }

    $scope.select_turno = function(idTurno){
      if ($scope.form.turnos[idTurno]) {
        $scope.form.turnos[idTurno] = 0;
      }
      else {
        $scope.form.turnos[idTurno] = 1;
      }
      document.getElementById(idTurno).classList.toggle('selected');;
    }

    $scope.select_option = function(idOption){
      var x = document.getElementsByClassName("options");
      var i;
      for (i = 0; i < x.length; i++) {
          x[i].className = "options option_"+ x[i].id +"_off";
      }
      var selected = document.getElementById(idOption);
      selected.className = "options option_"+ idOption;
      $scope.form.option = idOption;
      if(idOption=="map"){
        var estList = document.getElementById("list_container");
        var wrapper = document.getElementById("map_wrapper");
        estList.parentNode.insertBefore(wrapper, estList.nextSibling);
        wrapper.style.display="block";
        document.getElementById("map_container").style.display="block";
        document.getElementById("map_container").style.visibility="visible";
        document.getElementById("list_container").style.display="none";
        document.getElementById("form_container").style.minHeight="1000px";
      }
      if(idOption=="list"){
        document.getElementById("map_wrapper").style.display="none";
        document.getElementById("list_container").style.display="block";
        document.getElementById("map_container").style.visibility="hidden";
        document.getElementById("map_container").style.display="none";
        document.getElementById("form_container").style.minHeight="755px";
      }
    }

    $scope.onSearchChangeQue = function(){
      var search = document.getElementById("que_estudiar");
      var search_str = search.value.trim();
      if(search_str.length>=3){
        $scope.activateLoading('que_estudiar', 'mini');
        ApiService.searchQueEstudiar(search_str).then(function (response) {
          //console.log(response);
          $scope.form.SearchQueResults = response.data;
          document.getElementById("SearchQueResults").style.display = "block";
          document.getElementById("loading-mini").style.display = "none";
        });
      }else{
        $scope.hideSearchQueResults();
      }
    }

    $scope.hideSearchQueResults = function(){
      var results = document.getElementById("SearchQueResults");
      results.style.display = "none";
      //Move back just in case
      document.getElementById("modal-page").style.display="none";
      document.getElementById('que').appendChild(results);
    }

    $scope.selectQueEstudiarItem = function(curso){
      $scope.form.que = curso;
      $scope.hideSearchQueResults();
      $scope.form.searchQue = curso.nombre;
    }

    $scope.listAllQueEstudiar = function(){
      $scope.openModal('buscando', 'loading');
      ApiService.searchQueEstudiar("all").then(function (response) {
        //console.log(response);
        $scope.form.SearchQueResults = response.data;
        $scope.openModal('full', 'SearchQueResults');
        document.getElementById("loading").style.display = "none";
      });
    }

    $scope.onSearchChangeDonde = function(){
      var search = document.getElementById("donde_estudiar");
      var search_str = search.value.trim();
      if(search_str.length>=3){
        $scope.activateLoading('donde_estudiar', 'mini');
        ApiService.searchDondeEstudiar(search_str).then(function (response) {
          //console.log(response);
          $scope.form.SearchDondeResults = response.data;
          document.getElementById("SearchDondeResults").style.display = "block";
          document.getElementById("loading-mini").style.display = "none";
        });
      }else{
        $scope.hideSearchDondeResults();
      }
    }

    $scope.hideSearchDondeResults = function(){
      document.getElementById("SearchDondeResults").style.display = "none";
    }

    $scope.selectDondeEstudiarItem = function(donde){
      $scope.form.donde = donde;
      $scope.hideSearchDondeResults();
      $scope.form.searchDonde = donde.nombre;
    }

    $scope.editSearch = function(){
      $ionicSlideBoxDelegate.previous();
    }

	  $scope.next = function() {
	    $ionicSlideBoxDelegate.next();
	  };

	  $scope.previous = function() {
	    $ionicSlideBoxDelegate.previous();
	  };

    $scope.slideHasChanged = function(index){
      $scope.select_option("list");
      if(index==2){
        $scope.openModal('buscando', 'loading');
        //index 2 es el slide que tiene el botón del mapa y de el listado
        document.getElementById("map_container").style.display="none";
        ApiService.updateFilters($scope.form);
        if(MapService.mapScope != null){
          MapService.mapScope.filtersUpdated();
        }
        if(ApiService.filters!=null){
            ApiService.getEstablecimientosByFilters().then(function (response) {
              //ApiService.lastSearchResponseEstablecimientos = response.data;
              //EL SERVICIO DE LA API ACTUALIZA AL CONTROLADOR DEL MAPA
              $scope.cursos = response.data;
              var est = {};
              $scope.cursos.forEach(function(curso) {
                for ( var k in curso.oferta ){
                  if (curso.oferta.hasOwnProperty(k)) {
                    if ( !est.hasOwnProperty(k) ) {
                      est[k] = {
                        nombre: curso.oferta[k].nombre,
                        lat: curso.oferta[k].lat,
                        lon: curso.oferta[k].long,
                        id: curso.oferta[k].id,
                      }
                    }
                    //est[k][curso.año]
                  }
                }
              });
              $scope.establecimientos = Object.values(est);
              MapService.loadPinsLayer(Object.values(est), $scope);
              document.getElementById("modal-page").style.display="none";
            });
            /*if($scope.establecimientos==null){
              //ESTO SE PRECARGA PARA LA REUNION CON ROMANO EN CASO DE QUE NO ESTE LA API QUE RECIBE LOS FILTROS Y DEVUELVE LOS ESTABLECIMIENTOS
               $scope.establecimientos = [
                 {nombre: "Liceo Nº 1", id: 1214, lat: -34.906346, lon: -56.172065 },
                 {nombre: "Liceo Nº 2", id: 2434, lat: -34.902754, lon: -56.164127 },
                 {nombre: "Liceo Nº 7", id: 4324},
                 {nombre: "Liceo Juan Zorrilla", id: 5345}
               ];
               ApiService.updateMapPins($scope.establecimientos);
            }*/
        }
      }
    }

    $scope.openDetailsModal = function(id){
      $scope.openModal('buscando', 'loading');
      ApiService.getEstablecimientoById(id).then(function (response) {
        response.data.establecimientos[0].id=id;
        MapService.mapScope.openDetailsModal(response.data.establecimientos[0]);
        document.getElementById("modal-page").style.display="none";
      });
    }
    /**
    * Función para cerrar modal de ubicación
    */
    $scope.ubicacion = function(longlat){
      document.getElementById("map_wrapper").style.display="none";
      document.getElementById("donde_estudiar").value = "Ubicado en mapa"
      $scope.form.donde = {
        "departamento": "NA",
        "nombre": "Localizado en mapa",
        "lat": longlat[0],
        "long": longlat[1]
      };
      document.getElementById("modal-page").style.display="none";
    }
    /**
    * Función para abrir modal html
    */
    $scope.openModal = function(style, content){
      var modalContent = document.getElementById('modal-page-content');
      //Clean classes and nodes
      for (i = 0; i <= modalContent.length - 1; i++) {
        modalContent[i].style.display = "none";
      }
      modalContent.className = "intro_inside_rectangle";
      modalContent.classList.add(style);
      if ( style == "modal-map") {
        document.getElementById("map_container").style.display="block";
        document.getElementById("map_container").style.visibility="visible";
        MapService.goToPlace("primary_map", "Confirmar", $scope);
      }
      if ( style == "buscando") {
        document.getElementById('loading').style.display="block";
      }
      if ( style != "noLoad") {
        modalContent.appendChild(
          document.getElementById(content)
        );
        document.getElementById(content).style.display="block";
      }
      document.getElementById("modal-page").style.display="block";
      console.log("Modal open");
    }
    $scope.activateLoading = function(container, style) {
      var cont = document.getElementById( container );
      var loading = document.getElementById("loading-mini");
      loading.className = style;
      cont.parentNode.insertBefore( loading, cont.nextSibling );
      loading.style.display="block";
      console.log("Loading open");
    }
	  /*$scope.go_to_map = function(){
	    $state.go("app.map");
	  }*/
  }
]);
