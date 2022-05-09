var gulp = require('gulp');
var gulpif = require('gulp-if');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var webserver = require('gulp-webserver');
var path = require('path');

// var electronBuilder = require('electron-builder');
// var PLATFORM = electronBuilder.Platform;

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

var PATH_SRC_NODE = './node_modules/';
var PATH_SRC_CSS = './resource/pages/css/';
var PATH_RES_PLUGIN = './resource/pages/plugins/';
var PATH_DIST = './dist/';

var CSS_FILE_LIST = [
  'style.css'
];

// Compile and Dev
// ---------------------------------------------

gulp.task('compile', function (done) {
  var command = null;
  var argList = ['-p', '--progress'];
  if (isDebug) {
    console.log('WebPack: Web');
    console.log('-----------------------');
    argList.push(
      '--config=webpack.dev.config.js',
      '--mode', 'development'
    );
  } else {
    console.log('WebPack: Production');
    console.log('-----------------------');
    argList.push(
      '--config=webpack.prod.config.js',
      '--mode', 'production'
    );
  }

  execProcess('webpack', argList);
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

gulp.task('watch', function () {
  isDebug = true;
  gulp.watch(GLOB_SRC_JS).on('change', gulp.series('compile-js'));
  gulp.watch(GLOB_SRC_CSS).on('change', gulp.series('compile-css'));
  gulp.watch(GLOB_SRC_LANG).on('change', gulp.series('compile-lang'));
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


// Template Developement
// ---------------------------------------------
gulp.task('server', function () {
  let rootPath = './app/';
  gulp.src(rootPath)
    .pipe(webserver({
      port: 8080,
      directoryListing: false,
      open: true,
      fallback: 'index.html',
    }));
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
  console.log('Development HTTP Server    > gulp server');
  console.log('Compile Web JS             > gulp compile-web-js [--debug]');
  console.log('\n');
  done();
});