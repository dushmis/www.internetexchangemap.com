// Generated by CoffeeScript 1.4.0
(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  window.IxMap = {};

  IxMap.Search = (function() {

    Search.featuresJson = 'javascripts/features.json';

    Search.searchJson = 'javascripts/search.json';

    Search.searchFieldId = '#search';

    Search.exchangeLatLons = [];

    Search.prototype.lookupFromSearchTerm = function(searchName) {
      var _this = this;
      this.searchName = searchName;
      return jQuery.getJSON(IxMap.Search.featuresJson, function(data) {
        var exchange, _i, _len, _results;
        _this.map.clearAllBuildings();
        jQuery(IxMap.Search.searchFieldId).val("Search").blur();
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          exchange = data[_i];
          if (exchange.search_name === _this.searchName) {
            _results.push(jQuery(location).attr('href', "#/internet-exchange/" + exchange.slug_name));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      });
    };

    function Search(map) {
      var _this = this;
      this.map = map;
      jQuery.getJSON(IxMap.Search.searchJson, function(data) {
        return jQuery(IxMap.Search.searchFieldId).autocomplete({
          position: {
            my: "right top",
            at: "right bottom"
          },
          source: data,
          select: function(event, ui) {
            return _this.lookupFromSearchTerm(ui.item.value);
          }
        });
      });
      jQuery(IxMap.Search.searchFieldId).val("Search").focus(function() {
        jQuery(this).addClass("focus");
        if (jQuery(this).val() === "Search") {
          return jQuery(this).val("");
        }
      }).blur(function() {
        return jQuery(this).removeClass("focus").val("Search");
      });
    }

    return Search;

  })();

  IxMap.Map = (function() {

    Map.informationMarkupId = "#information";

    Map.markerPath = 'images/markers.png';

    Map.buildingsGeojson = 'javascripts/buildings.geojson';

    Map.exchangesListJson = 'javascripts/search.json';

    Map.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    Map.iconObj = {
      url: 'images/markers.png',
      size: new google.maps.Size(22, 29),
      origin: new google.maps.Point(0, 0)
    };

    Map.buildingZoomLevel = 12;

    Map.showAllExchanges = function() {
      var exchangeList;
      exchangeList = [];
      jQuery.getJSON(IxMap.Map.exchangesListJson, function(data) {
        var exchange, i, _i, _len, _results;
        _results = [];
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          exchange = data[i];
          _results.push(exchangeList.pushObject({
            id: i,
            name: exchange,
            slug: IxMap.Map.toSlug(exchange)
          }));
        }
        return _results;
      });
      return exchangeList;
    };

    Map.toSlug = function(str) {
      return str.toLowerCase().replace(/[^-a-z0-9~\s\.:;+=_]/g, '').replace(/[\s\.:;=+]+/g, '-');
    };

    Map.prototype.lookupExchangeForMap = function(searchName) {
      var _this = this;
      this.searchName = searchName;
      this.clearAllBuildings();
      return jQuery.getJSON(IxMap.Search.featuresJson, function(data) {
        var exchanges;
        exchanges = [];
        _this.bounds(jQuery.map(data, function(exchange, i) {
          if (exchange.slug_name === _this.searchName) {
            exchanges.push(exchange.building_id);
            return {
              latitude: exchange.latitude,
              longitude: exchange.longitude
            };
          }
        }));
        _this.clearAllBuildings();
        _this.showSearchBuildings(exchanges);
        return jQuery(IxMap.Search.searchFieldId).val("Search").blur();
      });
    };

    Map.prototype.lookupBuildingForMap = function(searchName) {
      var building, _i, _len, _ref, _results;
      this.searchName = searchName;
      this.infoBox.close();
      this.clearAllBuildings();
      this.showAllBuildings();
      _ref = this.buildings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        building = _ref[_i];
        if (building.geojsonProperties.building_id === parseInt(this.searchName, 10)) {
          this.selectBuildingFromList(building);
          if (this.gmap.getZoom() < 12) {
            _results.push(this.gmap.setZoom(IxMap.Map.buildingZoomLevel));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Map.prototype.showAllExchanges = function() {
      var _this = this;
      if (!this.exchangeList) {
        this.exchangeList = [];
      }
      jQuery.getJSON(IxMap.Map.exchangesListJson, function(data) {
        var exchange, i, _i, _len, _results;
        _results = [];
        for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
          exchange = data[i];
          _results.push(_this.exchangeList.pushObject({
            id: i,
            name: exchange
          }));
        }
        return _results;
      });
      return this.exchangeList;
    };

    Map.prototype.selectBuildingFromList = function(building, color) {
      var addr, infoMarkup, _i, _len, _ref;
      if (color == null) {
        color = 'blue';
      }
      this.infoBox.close();
      jQuery(location).attr('href', "#/building/" + building.geojsonProperties.building_id);
      infoMarkup = jQuery('<div/>').addClass("" + color + "-info-box-content").append(jQuery('<div/>').addClass("" + color + "-info-box-pointer"));
      this.gmap.panTo(building.position);
      _ref = building.geojsonProperties.address;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        addr = _ref[_i];
        infoMarkup.append(jQuery("<div/>").text(addr));
      }
      this.infoBox.setContent(jQuery('<div/>').append(infoMarkup).html());
      this.infoBox.setPosition(building.position);
      return this.infoBox.open(this.gmap);
    };

    Map.prototype.highlightExchangeBuildingFromList = function(buildingId, color) {
      var addr, building, infoMarkup, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (color == null) {
        color = 'red';
      }
      _ref = this.buildings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        building = _ref[_i];
        if (building.geojsonProperties.building_id === parseInt(buildingId, 10)) {
          this.infoBox.close();
          infoMarkup = jQuery('<div/>').addClass("" + color + "-info-box-content").append(jQuery('<div/>').addClass("" + color + "-info-box-pointer"));
          _ref1 = building.geojsonProperties.address;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            addr = _ref1[_j];
            infoMarkup.append(jQuery("<div/>").text(addr));
          }
          this.infoBox.setContent(jQuery('<div/>').append(infoMarkup).html());
          this.infoBox.setPosition(building.position);
          _results.push(this.infoBox.open(this.gmap));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Map.prototype.highlightExchangeBuilding = function(building, color) {
      var addr, infoMarkup, _i, _len, _ref;
      if (color == null) {
        color = 'red';
      }
      this.infoBox.close();
      infoMarkup = jQuery('<div/>').addClass("" + color + "-info-box-content").append(jQuery('<div/>').addClass("" + color + "-info-box-pointer"));
      _ref = building.geojsonProperties.address;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        addr = _ref[_i];
        infoMarkup.append(jQuery("<div/>").text(addr));
      }
      this.infoBox.setContent(jQuery('<div/>').append(infoMarkup).html());
      this.infoBox.setPosition(building.position);
      return this.infoBox.open(this.gmap);
    };

    Map.prototype.clearAllBuildings = function() {
      var building, _i, _len, _ref, _results;
      this.infoBox.close();
      _ref = this.buildings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        building = _ref[_i];
        google.maps.event.clearInstanceListeners(building);
        building.setIcon(IxMap.Map.iconObj);
        _results.push(building.setMap(null));
      }
      return _results;
    };

    Map.prototype.onClickMapEvent = function() {
      var _this = this;
      return google.maps.event.addListener(this.gmap, 'click', function(event) {
        var building, _i, _len, _ref;
        _this.infoBox.close();
        _this.clearAllBuildings();
        _ref = _this.buildings;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          building = _ref[_i];
          _this.setMarkerEventListener(building);
          building.setMap(_this.gmap);
        }
        return jQuery(location).attr('href', '#/');
      });
    };

    Map.prototype.setMarkerEventListener = function(building) {
      var _this = this;
      return google.maps.event.addListener(building, 'click', function(event) {
        return _this.selectBuildingFromList(building);
      });
    };

    Map.prototype.setSearchResultMarkerEventListener = function(building) {
      var _this = this;
      google.maps.event.addListener(building, 'mouseover', function(event) {
        return _this.highlightExchangeBuilding(building, 'red');
      });
      google.maps.event.addListener(building, 'mouseout', function(event) {
        return _this.infoBox.close();
      });
      return google.maps.event.addListener(building, 'click', function(event) {
        google.maps.event.clearListeners(building, 'mouseout');
        return _this.selectBuildingFromList(building, 'red');
      });
    };

    Map.prototype.showSearchBuildings = function(exchange) {
      var building, buildingList, included, x, _i, _len, _ref, _ref1;
      this.clearAllBuildings();
      buildingList = [];
      x = 0;
      _ref = this.buildings;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        building = _ref[_i];
        if (included = (_ref1 = building.geojsonProperties.building_id, __indexOf.call(exchange, _ref1) >= 0)) {
          building.setIcon({
            url: 'images/markers.png',
            size: new google.maps.Size(22, 29),
            origin: new google.maps.Point((x + 1) * 22, 0)
          });
          this.setSearchResultMarkerEventListener(building);
          building.setMap(this.gmap);
          buildingList.push({
            map: this,
            building: building,
            letter: x
          });
          x++;
        }
      }
      return buildingList;
    };

    Map.prototype.showAllBuildings = function() {
      var building, _i, _len, _ref, _results;
      this.clearAllBuildings();
      _ref = this.buildings;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        building = _ref[_i];
        this.setMarkerEventListener(building);
        building.setIcon(IxMap.Map.iconObj);
        _results.push(building.setMap(this.gmap));
      }
      return _results;
    };

    Map.prototype.bounds = function(exchangeLatLons) {
      var cableBounds, point, _i, _len;
      if (exchangeLatLons.length > 1) {
        cableBounds = new google.maps.LatLngBounds();
        for (_i = 0, _len = exchangeLatLons.length; _i < _len; _i++) {
          point = exchangeLatLons[_i];
          cableBounds.extend(new google.maps.LatLng(point.latitude, point.longitude));
        }
        return this.gmap.fitBounds(cableBounds);
      } else {
        this.gmap.setCenter(new google.maps.LatLng(exchangeLatLons[0].latitude, exchangeLatLons[0].longitude));
        return this.gmap.setZoom(10);
      }
    };

    function Map(element, center, zoom, buildings) {
      this.element = element;
      this.center = center;
      this.zoom = zoom;
      this.buildings = buildings;
      this.gmap = new google.maps.Map(document.getElementById(this.element), {
        zoom: this.zoom,
        maxZoom: 20,
        minZoom: 2,
        styles: [
          {
            featureType: "all",
            elementType: "all",
            stylers: [
              {
                "gamma": 1.7
              }
            ]
          }
        ],
        center: this.center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
      this.infoBox = new InfoBox({
        closeBoxURL: "",
        alignBottom: true,
        pixelOffset: new google.maps.Size(-60, -45)
      });
      this.search = new IxMap.Search(this);
      this.showAllBuildings();
      this.onClickMapEvent();
      return this;
    }

    return Map;

  })();

}).call(this);
