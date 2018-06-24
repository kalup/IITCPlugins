// ==UserScript==
// @id             iitc-plugin-change-zoomlevel
// @name           IITC plugin: Change Zoom Level
// @category       Tweaks
// @version        0.1
// @namespace      https://iitc.me
// @description    Based on TheSned work at https://github.com/TheSned/IITCPlugins/ - Force IITC to load all portals, all links, or change by a defined offset the default zoom level.
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
	// ensure plugin framework is there, even if iitc is not yet loaded
	if(typeof window.plugin !== 'function') window.plugin = function() {};


	// PLUGIN START ////////////////////////////////////////////////////////


	// use own namespace for plugin
	window.plugin.changeZoomLevel = function() {};

	window.plugin.changeZoomLevel.mode = 'Default';
	window.plugin.changeZoomLevel.functionsOverwritten = false;
	window.plugin.changeZoomLevel.zoomOptions = {
		'Default' : 'Default', 
		'Default1' : 'Default +1', 
		'Default2' : 'Default +2', 
		'Default3' : 'Default +3', 
		'AllLinks' : 'All Links', 
		'AllPortals' : 'All Portals'
	};



	window.plugin.changeZoomLevel.showDialog = function() {
		var div = document.createElement('div');

		div.appendChild(document.createTextNode('Select a forced zoom level: '));
		div.appendChild(document.createElement('br'));

		for(var option in window.plugin.changeZoomLevel.zoomOptions) {
			var label = div.appendChild(document.createElement('label'));
			var input = label.appendChild(document.createElement('input'));
			input.type = 'radio';
			input.name = 'plugin-cange-zoomlevel';
			input.value = option;
			if(option === window.plugin.changeZoomLevel.mode) {
				input.checked = true;
			}

			input.addEventListener(
				'click',
				function(opt) {
					return function() {
						window.plugin.changeZoomLevel.setMode(opt);
					}
				}(option),
				false
			);

			label.appendChild(document.createTextNode(' ' + window.plugin.changeZoomLevel.zoomOptions[option]));

			div.appendChild(document.createElement('br'));
		}

		dialog({
			id: 'plugin-change-zoomlevel',
			html: div,
			title: 'Change Zoom Level',
		});
	};

	window.plugin.changeZoomLevel.setMode = function (mode) {
		window.plugin.changeZoomLevel.mode = mode;
		localStorage['plugin-changeZoomLevel-mode'] = mode;
		switch(mode) {
			case 'Default':
				window.getDataZoomForMapZoom = window.getDataZoomForMapZoomDefault;
			break;
			case 'Default1':
				window.getDataZoomForMapZoom = window.getDataZoomForMapZoomDefault() + 1;
			break;
			case 'Default2':
				window.getDataZoomForMapZoom = window.getDataZoomForMapZoomDefault() + 2;
			break;
			case 'Default3':
				window.getDataZoomForMapZoom = window.getDataZoomForMapZoomDefault() + 3;
			break;
			case 'AllLinks':
				window.getDataZoomForMapZoom = window.getDataZoomForMapZoomAllLinks;
			break;
			case 'AllPortals':
				window.getDataZoomForMapZoom = window.getDataZoomForMapZoomAllPortals;
			break;
		}
		window.mapDataRequest.start();
	}

	window.plugin.changeZoomLevel.setup  = function() {
		$('#toolbox').append(' <a onclick="window.plugin.changeZoomLevel.showDialog()">Change Zoom Opt</a>');

		window.getDataZoomForMapZoomDefault = window.getDataZoomForMapZoom;
		window.getDataZoomForMapZoomAllLinks = function() { return 13; };
		window.getDataZoomForMapZoomAllPortals = function() { return 17 };

		try {
			var mode = localStorage['plugin-changeZoomLevel-mode'];
			if(typeof(mode) === 'undefined') {
				mode = 'Default';
			}
			window.plugin.changeZoomLevel.setMode(mode);
		} catch(e) {
			console.warn(e);
			window.plugin.changeZoomLevel.mode = 'Default';
		}
	};

	var setup =  window.plugin.changeZoomLevel.setup;

	// PLUGIN END //////////////////////////////////////////////////////////


	setup.info = plugin_info; //add the script info data to the function as a property
	if(!window.bootPlugins)
		window.bootPlugins = [];
	window.bootPlugins.push(setup);
	// if IITC has already booted, immediately run the 'setup' function
	if(window.iitcLoaded && typeof setup === 'function')
		setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script)
	info.script = {
		version: GM_info.script.version,
		name: GM_info.script.name,
		description: GM_info.script.description
	};
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
