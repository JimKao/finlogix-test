var gulp = require('gulp');
var gulpif = require('gulp-if');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var webserver = require('gulp-webserver');
var path = require('path');

var electronBuilder = require('electron-builder');
var PLATFORM = electronBuilder.Platform;

var fs = require('fs');
var argv = require('yargs').argv;

var isDebug = argv.debug !== undefined;
var isWin = process.platform === 'win32';
var buildMode = isDebug ? 'Debug' : 'Release';

// Variables
// --------------------------------------------------------------
var PATH_APP = './app/';

var GLOB_SRC_JS = './src/js/**/*.js';
var GLOB_SRC_CSS = './resource/pages/css/**/*.css';
var GLOB_SRC_LANG = './src/lang/**/*';

var MAIN_JS_FILE = 'index.js';
var PATH_MAIN_JS = './src/js/';
var PATH_MAIN_JS_FILE = PATH_MAIN_JS + MAIN_JS_FILE;

var PATH_DESC = './app/';
var PATH_DESC_CSS = PATH_DESC + 'css/';
var PATH_DESC_LANG = PATH_DESC + 'lang/';
var PATH_DESC_JS = PATH_DESC + 'js/';
var PATH_DESC_FONT = PATH_DESC + 'fonts/';
var PATH_DESC_IMG = PATH_DESC + 'images/';
var PATH_DESC_MEDIA = PATH_DESC + 'media/';
var PATH_DESC_MANAUL = PATH_DESC + 'help/';
var PATH_DESC_NODE = './app/node_modules/';
var PATH_DEST_PLUGIN = './app/plugins/';

var PATH_MOBILE_DESC = './app-mobile/';
var PATH_MOBILE_DESC_WEB = PATH_MOBILE_DESC + '/www/';
var PATH_MOBILE_DESC_CSS = PATH_MOBILE_DESC_WEB + 'css/';
var PATH_MOBILE_DESC_LANG = PATH_MOBILE_DESC_WEB + 'lang/';
var PATH_MOBILE_DESC_JS = PATH_MOBILE_DESC_WEB + 'js/';
var PATH_MOBILE_DESC_FONT = PATH_MOBILE_DESC_WEB + 'fonts/';
var PATH_MOBILE_DESC_IMG = PATH_MOBILE_DESC_WEB + 'images/';
var PATH_MOBILE_DESC_MEDIA = PATH_MOBILE_DESC_WEB + 'media/';
var PATH_MOBILE_DEST_PLUGIN = PATH_MOBILE_DESC_WEB + 'plugins/';
var PATH_MOBILE_DESC_PLATFORM = PATH_MOBILE_DESC + 'platforms/';

var PATH_SRC_NODE = './node_modules/';
var PATH_SRC_CSS = './resource/pages/css/';
var PATH_RES_PLUGIN = './resource/pages/plugins/';
var PATH_DIST = './dist/';

var CSS_FILE_LIST = [
  'reset.css', 'style.css',
  'style-portrait.css', 'style-landscape.css', 'style-square.css',
  'style-pad-general.css', 'style-pad-landscape.css', 'style-pad-portrait.css',
  'style-phone-general.css', 'style-phone-landscape.css', 'style-phone-portrait.css', 'style-phone-square.css',
  'lang-en_us.css', 'lang-zh_tw.css', 'lang-zh_cn.css',
  'theme-honeywell.css'
];

// Compile and Dev
// ---------------------------------------------
gulp.task('compile-app-js', function (done) {
  var command = null;
  var argList = ['-p', '--progress'];
  if (isDebug) {
    console.log('WebPack: Dev');
    console.log('-----------------------');
    argList.push(
      '--config=webpack.dev.js',
      '--mode', 'development'
    );
  } else {
    console.log('WebPack: Production');
    console.log('-----------------------');
    argList.push(
      '--config=webpack.prod.js',
      '--mode', 'production'
    );
  }

  execProcess('webpack', argList);
  // Mobile
  copyFolder(
    PATH_DESC_JS + '/**/*', PATH_MOBILE_DESC_WEB, 'app');
  done();
});

gulp.task('compile-web-js', function (done) {
  var command = null;
  var argList = ['-p', '--progress'];
  if (isDebug) {
    console.log('WebPack: Web');
    console.log('-----------------------');
    argList.push(
      '--config=webpack.web.js',
      '--mode', 'development'
    );
  } else {
    console.log('WebPack: Production');
    console.log('-----------------------');
    argList.push(
      '--config=webpack.web.prod.js',
      '--mode', 'production'
    );
  }

  execProcess('webpack', argList);
  // Mobile
  copyFolder(
    PATH_DESC_JS + '/**/*', PATH_MOBILE_DESC_WEB, 'app');
  done();
});

gulp.task('compile-css', function () {

  // Read and merge all css files
  var buffer = '';
  for (var idx in CSS_FILE_LIST) {
    if (CSS_FILE_LIST[idx].indexOf('lang-') != 0 &&
      CSS_FILE_LIST[idx].indexOf('theme-') != 0) {
      buffer += readUtf8File(PATH_SRC_CSS + CSS_FILE_LIST[idx]);
    }
  }

  // Ensure directory
  ensurePath(PATH_DESC_CSS);
  var mergedCssPath = PATH_DESC_CSS + 'style.all.css';
  writeUtf8File(buffer, mergedCssPath);

  ensurePath(PATH_MOBILE_DESC_CSS);

  // Copy CSS file
  return gulp.src(mergedCssPath)
    .pipe(gulpif(!isDebug, cssmin()))
    .pipe(gulpif(!isDebug, rename({
      suffix: '.min'
    })))
    .pipe(gulp.dest(PATH_DESC_CSS))
    .pipe(gulp.dest(PATH_MOBILE_DESC_CSS));

});

gulp.task('compile-lang', function () {
  return gulp.src(GLOB_SRC_LANG)
    .pipe(gulp.dest(PATH_DESC_LANG))
    .pipe(gulp.dest(PATH_MOBILE_DESC_LANG));
});

gulp.task('compile-js',
  gulp.parallel('compile-app-js'));

gulp.task('compile',
  gulp.parallel('compile-js', 'compile-css', 'compile-lang'));

gulp.task('watch', function () {
  isDebug = true;
  gulp.watch(GLOB_SRC_JS).on('change', gulp.series('compile-js'));
  gulp.watch(GLOB_SRC_CSS).on('change', gulp.series('compile-css'));
  gulp.watch(GLOB_SRC_LANG).on('change', gulp.series('compile-lang'));
});

gulp.task('run', function (done) {
  var argList = [];
  if (isDebug) {
    argList.push('--debug', '--enable-precise-memory-info');
  }
  argList.push('app');

  if (process.platform === 'win32') {
    execProcess('electron', argList);
  } else {
    execProcess('./node_modules/.bin/electron', argList);
  }
  done();
});

gulp.task('mobile-launch', function (done) {
  var argList = [];
  var osType;
  if (argv.ios) {
    argList = ['run', 'ios', '--buildFlag="-UseModernBuildSystem=0"'];
  } else if (argv.android) {
    argList = ['run', 'android'];
  }

  if (argv.device) {
    argList.push('--device');
  }

  execProcess('cordova', argList, './app-mobile/');
  done();
});

gulp.task('add-platform', function (done) {
  var argList = [];
  if (argv.ios) {
    argList = ['platform', 'add', 'ios'];
  } else if (argv.android) {
    argList = ['platform', 'add', 'android'];
  }

  var path = PATH_MOBILE_DESC_PLATFORM + argList[2];
  console.log('Platform path :' + path);
  if (!fs.existsSync(path)) {
    console.log('Platform is not exist!');
    execProcess('cordova', argList, './app-mobile/');
  }

  done();
});

gulp.task('del-platform', function (done) {
  var argList = [];
  if (argv.ios) {
    argList = ['platform', 'remove', 'ios'];
  } else if (argv.android) {
    argList = ['platform', 'remove', 'android'];
  }

  var path = PATH_MOBILE_DESC_PLATFORM + argList[2];
  if (fs.existsSync(path)) {
    execProcess('cordova', argList, './app-mobile/');
  }

  done();
});

gulp.task('update-platform', gulp.series('del-platform', 'add-platform'));
gulp.task('run-mobile', gulp.series('add-platform', 'mobile-launch'));

// Build Code
// ---------------------------------------------
gulp.task('update-build', function (done) {

  var json = require('json-file');
  var filePath = PATH_APP + 'package.json';
  var file = json.read(filePath);

  var buildNo = parseInt(file.get('buildNo'));
  if (isNaN(buildNo)) {
    buildNo = 0;
  }

  file.set('buildNo', buildNo + 1);
  file.set('buildTs', new Date().getTime());

  var git = require('git-rev-sync');
  file.set('buildRev', git.short());

  // Write the updates to the file
  file.writeSync();

  var fs = require('fs');
  var buf = fs.readFileSync(filePath, 'utf8');

  buf = JSON.stringify(JSON.parse(buf), null, 4);
  fs.writeFileSync(filePath, buf, 'utf8');

  done();
});

gulp.task('set-build-info', function (done) {

  var buildNo = argv['build-no'];
  var buildRev = argv['build-rev'];

  console.log('Set Build No: ' + buildNo);
  console.log('Set Build Rev: ' + buildRev);

  var json = require('json-file');
  var filePath = PATH_APP + 'package.json';
  var file = json.read(filePath);

  file.set('buildNo', buildNo);
  file.set('buildTs', new Date().getTime());
  file.set('buildRev', buildRev);

  // Write the updates to the file
  file.writeSync();

  var fs = require('fs');
  var buf = fs.readFileSync(filePath, 'utf8');

  buf = JSON.stringify(JSON.parse(buf), null, 4);
  fs.writeFileSync(filePath, buf, 'utf8');

  done();
});


// Resource Update
// ---------------------------------------------
gulp.task('update-css', function (done) {
  ensurePath(PATH_DESC_CSS);
  for (var idx in CSS_FILE_LIST) {
    updateFile(CSS_FILE_LIST[idx], PATH_DESC_CSS, PATH_SRC_CSS);
    updateFile(CSS_FILE_LIST[idx], PATH_MOBILE_DESC_CSS, PATH_SRC_CSS);
  }
  done();
});

gulp.task('update-font', function (done) {
  var basePath = 'resource/pages/fonts/';
  syncFolder(PATH_DESC_FONT, basePath);
  syncFolder(PATH_MOBILE_DESC_FONT, basePath);
  done();
});

gulp.task('update-img', function (done) {
  var basePath = 'resource/pages/images/';
  syncFolder(PATH_DESC_IMG, basePath);
  syncFolder(PATH_MOBILE_DESC_IMG, basePath);
  done();
});

gulp.task('update-media', function (done) {
  var basePath = 'resource/media/';
  syncFolder(PATH_DESC_MEDIA, basePath);
  syncFolder(PATH_MOBILE_DESC_MEDIA, basePath);
  done();
});

gulp.task('update-plugin', function (done) {
  var npmPath = 'node_modules';
  var moduleAry = [
    'jquery', 'chart.js', 'clientjs', 'three', 'stats.js', 'gsap', 'framework7'
  ];

  var moduleId;
  for (var idx in moduleAry) {
    moduleId = moduleAry[idx];
    console.log('Update Plugin: ' + moduleId);
    copyFolder(
      path.join(npmPath, moduleId) + '/**/*', PATH_DEST_PLUGIN, npmPath);
    copyFolder(
      path.join(npmPath, moduleId) + '/**/*', PATH_MOBILE_DEST_PLUGIN, npmPath);
    copyFolder(
      path.join(npmPath, moduleId) + '/**/*', PATH_RES_PLUGIN, npmPath);
  }
  done();
});

gulp.task('update-res',
  gulp.parallel(
    'update-css', 'update-font', 'update-img',
    'update-media', 'update-plugin'));

// Template Developement
// ---------------------------------------------
gulp.task('server', function () {
  var rootPath = './resource/pages/';
  if (argv.app) {
    rootPath = './app/';
  } else if (argv.mobile) {
    rootPath = './app-mobile/www/';
  }
  gulp.src(rootPath)
    .pipe(webserver({
      port: 8088,
      directoryListing: false,
      open: true,
      fallback: 'start.html',
    }));
});

gulp.task('mustache', function (done) {
  var templatePath = 'resource/template/';
  var templatePartialPath = 'resource/template/partial/';
  var jsonPath = 'resource/json/';
  var outputPath = 'resource/pages/';

  var partialFiles = fs.readdirSync(templatePartialPath);
  var isCompileAll = true;
  var file = '';

  // Get all partial files
  if (argv.view) {
    isCompileAll = false;
    file = argv.view;
  }

  if (isCompileAll) {
    var filelist = fs.readdirSync(jsonPath);
    var filename = null;
    for (var idx in filelist) {
      filename = filelist[idx];
      if (filename.indexOf('.json') > -1 && filename != 'general.json') {
        var jsonFile = jsonPath + '/' + filename;
        var template = templatePath + filename.replace('.json', '.mustache');
        var outputFile = outputPath + '/' + filename.replace('.json', '.html');
        compileMustacheFile(jsonFile, template, partialFiles, outputFile);
      }
    }
  } else {
    var jsonFile = jsonPath + '/' + file + '.json';
    var template = templatePath + file + '.mustache';
    var outputFile = outputPath + '/' + file + '.html';
    compileMustacheFile(jsonFile, template, partialFiles, outputFile);
  }
  done();
});

// Build Binary
// ---------------------------------------------
gulp.task('build-binary', function () {
  // https://github.com/electron-userland/electron-builder/wiki/Options#development-packagejson
  var targetsParam = null;

  if (argv.windows != undefined || process.platform === 'win32') {
    targetsParam = PLATFORM.WINDOWS.createTarget();
  } else if (argv.linux != undefined || process.platform === 'linux') {
    targetsParam = PLATFORM.LINUX.createTarget();
  } else if (argv.armv7 != undefined || process.platform === 'armv7') {
    targetsParam = PLATFORM.LINUX.createTarget(null, electronBuilder.Arch.armv7l);
    //targetsParam.arch = ['armv7l'];
  } else if (argv.mac != undefined || process.platform === 'darwin') {
    targetsParam = PLATFORM.MAC.createTarget();
  }

  console.log(targetsParam);


  if (targetsParam == null) {
    console.log('Please specify build target: --mac|--windows|--linux');
    return;
  }

  return electronBuilder.build({
      targets: targetsParam,
      config: {
        files: ['**/*']
      }
    })
    .then(() => {
      console.log('Build Done');
    })
    .catch((error) => {
      console.log(error);
    });

});

gulp.task('build',
  gulp.series('update-res', 'compile', 'build-binary'));

// Test
// ---------------------------------------------
gulp.task('ut', function (done) {
  var argList = [];
  argList.push('-c', 'jest-UT.json');
  if (argv.file != undefined) {
    argList.push('--', argv.file);
  }
  var res = execProcess('./node_modules/.bin/jest', argList);
  res.status == 0 ? done() : done(res.status);

});
gulp.task('ft', function (done) {
  var argList = [];
  argList.push('-c', 'jest-FT.json');
  var res = execProcess('./node_modules/.bin/jest', argList);
  res.status == 0 ? done() : done(res.status);
});
gulp.task('st', function (done) {
  var argList = [];
  argList.push('-c', 'jest-ST.json');
  var res = execProcess('./node_modules/.bin/jest', argList);
  res.status == 0 ? done() : done(res.status);
});


// Internal Functions
// ---------------------------------------------
function execProcess(cmd, argList, directory) {
  if (!directory) {
    directory = '.';
  }
  var spawn = require('child_process').spawnSync;
  if (isWin) {
    argList.unshift('/c', cmd);
    return spawn('cmd.exe', argList, {
      stdio: 'inherit',
      cwd: directory
    });
  } else {
    return spawn(cmd, argList, {
      stdio: 'inherit',
      cwd: directory
    });
  }

}

function copyFolder(src, dest, base) {
  return gulp.src(src, {
      'base': base
    })
    .pipe(gulp.dest(dest));
};

function updateFile(filename, dstPath, srcPath) {
  var dstFilePath = path.join(dstPath, filename).replace(/\\/g, '/');
  var srcFilePath = path.join(srcPath, filename).replace(/\\/g, '/');
  console.log('Copy:' + srcFilePath + ' -> ' + dstFilePath);
  gulp.src(srcFilePath)
    .pipe(gulp.dest(dstPath));
}

function syncFolder(dstPath, srcPath) {
  var filelist = fs.readdirSync(srcPath);
  var filename = null;
  for (var idx in filelist) {
    if (!fs.lstatSync(path.join(srcPath, filelist[idx])).isDirectory()) {
      updateFile(filelist[idx], dstPath, srcPath);
    } else {
      folderName = filelist[idx];
      if (folderName != 'src') {
        syncFolder(path.join(dstPath, folderName),
          path.join(srcPath, folderName));
      }
    }
  }
}

function compileMustacheFile(json, template, partials, output) {
  console.log('-----------------------');
  console.log('Compile JSON: ' + json);
  console.log('Compile Template: ' + template);
  console.log('Compile Partials: ' + partials.join());
  console.log('Compile Output: ' + output);

  var templatePartialPath = 'resource/template/partial/';
  var args = [];

  var filename = null;
  for (var idx in partials) {
    args.push('-p');
    args.push(templatePartialPath + partials[idx]);
  }

  args.push(json);
  args.push(template);

  var execSync = require('child_process').execSync;
  var buf = execSync('mustache ' + args.join(' '));

  var fs = require('fs');
  fs.writeFileSync(output, buf, 'utf8');
}

function readUtf8File(filePath) {
  var fs = require('fs');
  return fs.readFileSync(filePath, 'utf8');
}

function writeUtf8File(buffer, filePath) {
  var fs = require('fs');
  fs.writeFileSync(filePath, buffer, 'utf8');
}

function ensurePath(folderPath) {
  var mkdirp = require('mkdirp');
  mkdirp.sync(folderPath);
}

gulp.task('default', function (done) {
  console.log('\n');

  // Build Binary
  console.log('\nBuild Binary');
  console.log('-----------------------');
  console.log('Update build numbers       > gulp update-build');
  console.log('Set build info             > gulp set-build-info --build-no [build-no] --build-rev [build-rev] ');
  console.log('Build App Binary           > ' +
    'gulp build-binary [--mac|--windows--linux]');
  console.log('Total Build                > ' +
    'gulp build [--mac|--windows--linux]');

  // Compile and Dev
  console.log('\nCompile and Dev');
  console.log('-----------------------');
  console.log('Compile App                > gulp compile [--debug]');
  console.log('Compile JS                 > gulp compile-js [--debug]');
  console.log('Compile APP JS             > gulp compile-app-js [--debug]');
  console.log('Compile Web JS             > gulp compile-web-js [--debug]');
  console.log('Compile CSS                > gulp compile-css [--debug]');
  console.log('Compile L10N Resource      > gulp compile-lang');
  console.log('Compile upon JS/CSS change > gulp watch');
  console.log('Run App                    > gulp run [--debug]');

  //Mobile app
  // console.log('\nMobile app');
  // console.log('-----------------------');
  // console.log('update Mobile platform     > gulp update-platform [--ios|--android]');
  // console.log('Run Mobile App             > ' +
  //   'gulp run-mobile [--ios|--android] [--device]');

  // Resource Update
  console.log('\nResource Update');
  console.log('-----------------------');
  console.log('Update all resource        > gulp update-res');
  console.log('Update css from resource   > gulp update-css');
  console.log('Update fonts from resource > gulp update-font');
  console.log('Update imgs from resource  > gulp update-img');
  console.log('Update front-end plugins   > gulp update-plugin');

  // Testing
  console.log('\nTest');
  console.log('-----------------------');
  console.log('Unit Test                  > gulp ut');
  console.log('Function Test              > gulp ft');
  console.log('Stress Test                > gulp st');

  // Template Developement
  console.log('\nTemplate Developement');
  console.log('-----------------------');
  console.log('Development HTTP Server    > gulp server');
  console.log('Compile all mustach        > gulp mustache');
  console.log('Compile mustach file       > gulp mustache --view [filename]');
  console.log('\n');
  done();
});