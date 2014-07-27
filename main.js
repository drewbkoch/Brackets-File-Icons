define(function(require, exports, module) {
	var fileInfo = {};

	function addIcon(extension, icon, color, size) {
		fileInfo[extension] = {
			icon: icon,
			color: color,
			size: size
		};
	}
	function addAlias(extension, other) {
		fileInfo[extension] = fileInfo[other];
	}
	function getDefaultIcon(extension) {
		if (extension === '') {
			return {
				color: '#94a3a7',
				icon: '\uf011'
			};
		}

		var hue = 0;
		var saturnation = 90;
		var lightness = 50;

		for (var i = 0; i < extension.length; ++i) {
			hue += extension.charCodeAt(i) * 42 * (i + 2);
			hue %= 256;
			saturnation = (saturnation + (extension.charCodeAt(i) % 30) + 70) / 2;
			lightness = (lightness + (extension.charCodeAt(i) * 3 % 40) + 30) / 2;
		}

		return {
			color: 'hsl(' + Math.round(hue) + ', ' + Math.round(saturnation) + '%, ' + Math.round(lightness) + '%)',
			icon: '\uf12f'
		};
	}

	// XML
	addIcon('xml',    '\uf05f', '#ff6600');
	addIcon('html',   '\uf13b', '#d28445');
    	addAlias('htm',   'html');

	// Stylesheets
	addIcon('css',    '\uf13c', '#6a9fb5');
	addIcon('scss',   '\uf13c', '#c6538c');
	addAlias('sass',  'scss');
	addIcon('less',   '\uf13c', '#3b6bb2');
	addIcon('styl',   '\uf13c', '#b3d107');

	// JavaScript
	addIcon('js',     '\uf05f', '#f4bf75');
	addIcon('ts',     '\uf05f', '#0074c1');
	addIcon('coffee', '\ue0b3', '#c9905e');
	addIcon('json',   '\uf096', '#F4BF75');
	addIcon('ls',     '\uf269', '#369bd7');

	// Server side
	addIcon('php',    '\ue09a', '#6976c3');
	addIcon('sql',    '\uf096', '#c67f07');

	// Java
	addIcon('java',   '\ue098', '#75b4de');
	addAlias('class', 'java');

	// Shell and friends
	addIcon('sh',     '\ue0b7');
	addIcon('bat',    '\ue0b7');
	addIcon('command','\ue0b7');

	// Templating
	addIcon('jade',   '\uf13b', '#01dfa5');

	// Images
	addIcon('png',    '\uf012', '#dbb1a9');
	addIcon('jpg',    '\uf012', '#dedfa3');
	addAlias('jpeg',  'jpg');
	addIcon('tiff',   '\uf012', '#ff4000');
	addIcon('ico',    '\uf012', '#b6d2d1');
	addIcon('svg',    '\uf012', '#c0c5eb');

	addIcon('gif',    '\uf012', '#aaecc0');

	// Videos
	addIcon('mp4',    '\uf094');
	addAlias('webm',  'mp4');
	addAlias('ogg',   'mp4');

	// Audio
	addIcon('mp3',    '\uf094');
	addAlias('wav',   'mp3');

	// Fonts
	addIcon('ttf',    '\uf094');
	addIcon('eot',    '\uf094');
	addIcon('woff',    '\uf094');

	// Readme
	addIcon('md', '\uf0c9', '#c36b35');
	addAlias('markdown', 'md');

	// Git
	addIcon('gitignore', '\uf084', '#a0422e', 18);
	addIcon('gitmodules', '\uf020', '#a0422e');

	// Webservers
	addIcon('htaccess', '\uf02f');
	addIcon('htpasswd', '\uf02f');
	addIcon('conf',   '\uf02f');

	// Archive
	addIcon('zip',    '\uf013');
	addIcon('rar',    '\uf013');
	addIcon('7z',     '\uf013');
	addIcon('tgz',    '\uf013');
	addIcon('tar',    '\uf013');
	addIcon('gz',     '\uf013');
	addIcon('bzip',   '\uf013');

	// Settings
	addIcon('project', '\uf013');
	addAlias('jscsrc', 'project');
	addAlias('jshintrc', 'project');
	addAlias('csslintrc', 'project');
	addAlias('todo', 'project');
	addAlias('classpath', 'project');

	// Other text files
	addIcon('txt',    '\uf011');
	addIcon('log',    '\uf011');
	addIcon('npmignore', '\uf084', '#a0422e', 18);
	addIcon('yml',   '\uf011');
	addIcon('ls', '\uf011');

	var ProjectManager = brackets.getModule('project/ProjectManager');
	var DocumentManager = brackets.getModule('document/DocumentManager');
	var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

	ExtensionUtils.loadStyleSheet(module, "styles/style.css");

	function renderFiles() {
		$('#project-files-container ul').removeClass('jstree-no-icons').addClass('jstree-icons');

		var $items = $('#project-files-container li>a');

		$items.each(function(index) {
			var ext = ($(this).find('.extension').text() || $(this).text().substr(1) || '').substr(1).toLowerCase();
			var lastIndex = ext.lastIndexOf('.');
			if (lastIndex > 0) {
				ext = ext.substr(lastIndex + 1);
			}
            
			var data;

			if ($(this).parent().hasClass('jstree-leaf')) {
				data = fileInfo.hasOwnProperty(ext) ? fileInfo[ext] : getDefaultIcon(ext);
			} else {
				return;
			}

			var $new = $(this).find('.jstree-icon');
			$new.text(data.icon);
			$new.addClass('file-icon');
			$new.css({
				color: data.color,
				fontSize: (data.size || 16) + 'px'
			});
		});
	}
	function renderWorkingSet() {
		$('#open-files-container li>a>.file-icon').remove();

		var $items = $('#open-files-container li>a');

		$items.each(function(index) {
			var ext = ($(this).find('.extension').text() || $(this).text() || '').substr(1).toLowerCase();
			var lastIndex = ext.lastIndexOf('.');
			if (lastIndex > 0) {
				ext = ext.substr(lastIndex + 1);
			}

			var data = fileInfo.hasOwnProperty(ext) ? fileInfo[ext] : getDefaultIcon(ext);

			var $new = $('<div>');
			$new.text(data.icon);
			$new.addClass('file-icon');
			$new.css({
				color: data.color,
				fontSize: (data.size || 16) + 'px'
			});
			$(this).prepend($new);
		});
	}

	function projectOpen() {
		var events = 'load_node.jstree create_node.jstree set_text.jstree';

		renderFiles();

		$('#project-files-container').off(events, renderFiles);
		$('#project-files-container').on(events, renderFiles);
	}

	$(ProjectManager).on('projectOpen projectRefresh', projectOpen);

	$(DocumentManager).on("workingSetAdd workingSetAddList workingSetRemove workingSetRemoveList fileNameChange pathDeleted workingSetSort", function() {
		renderWorkingSet();
	});

	projectOpen();
	renderWorkingSet();
});
