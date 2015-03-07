var gulp = require('gulp'),
    sketch = require('gulp-sketch'),
    fm = require('front-matter'),
    data = require('gulp-data'),
    jade = require('gulp-jade'),
    libsass = require('gulp-sass'),
    minifycss= require('gulp-minify-css'),
    notify = require('gulp-notify'),
    newer = require('gulp-newer'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload,
    path = require('path'),
    bower = require('gulp-bower'),
    preen = require('preen'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    del = require('del'),
    iconfont = require('gulp-iconfont'),
    rename = require('gulp-rename'),
    consolidate = require('gulp-consolidate'),
    sourcemaps = require('gulp-sourcemaps'),
    cache = require('gulp-cached'),
    jadeAffected = require('gulp-jade-find-affected'),
    postcss = require('gulp-postcss'),
    minimist = require('minimist'),
    mqpacker = require('css-mqpacker'),
    prefix = require('autoprefixer-core'),
    pixrem = require('gulp-pixrem');
 
var paths = {
  templates: './src/jade/',
  sass: './src/css/',
  sketch: './src/sketch/',
  images: './src/images/**/*',
  scripts: './src/js/'
};


// ******************************
// CLI argumenten
// ******************************
var knownOptions = {
  string: 'env',
  default: { env: 'development' }
};

var options = minimist(process.argv.slice(2), knownOptions);

// ******************************
// Dist map leegmaken
// ******************************
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['dist'], cb);
});

// ******************************
// Bower componenten installeren
// ******************************
gulp.task('bower', function() {
  return bower()
});

gulp.task('preen', ['bower'], function(cb) {
  preen.preen({}, cb);
});

// ******************************
// Custom Javascripts 
// ******************************
gulp.task('scripts', function() {
  return gulp.src(path.join(paths.scripts, '**/*.js'))
    .pipe(cache('js'))
    .pipe(sourcemaps.init())
    .pipe(concat('scripts.min.js'))
    .pipe(uglify())
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(notify({ title: 'Gulp: scripts updated', message: '<%= file.relative %>' }));
});
  
// ******************************
// Jade (HTML) templates
// ******************************
gulp.task('jade', function() {
    
  return gulp.src('./src/jade/**/*.jade')
    
    // Front matter
    .pipe(data(function(file) {
      var content = fm(String(file.contents));
      file.contents = new Buffer(content.body);
      return content.attributes;
    }))
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })

    // Parse jade
    .pipe(jade({
      pretty: true,
      basedir: paths.templates
    }))
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })
    
    // Output
    .pipe(gulp.dest('./dist/'))
    .pipe(reload({stream:true}))
    .pipe(notify({ title: 'Gulp: Jade compiled', message: '<%= file.relative %>' }));
});
    
// ******************************
// Statische plaatjes 
// ******************************
gulp.task('images', function() {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(cache('images'))
    .pipe(newer('./dist/images/'))
    .pipe(gulp.dest('./dist/images/'))
    .pipe(reload({stream:true}));
});


// ******************************
// Sass (SCSS)
// ******************************
gulp.task('sass', function() {
           
  var stream = gulp.src(path.join(paths.sass, '**/*.scss'));
  
  if (options.env !== 'production') {
    stream = stream.pipe(sourcemaps.init());
  }
  
  stream = stream.pipe(libsass({includePaths: require('node-bourbon').with('./node_modules/susy/sass/'),
                 errLogToConsole: true,
                     outputStyle: 'nested',
                  sourceComments: false
  }))
  .on('error', function(error) {
    // Would like to catch the error here
    console.log(error);
    this.emit('end');
  });
  
  if (options.env !== 'production') {
    stream = stream.pipe(postcss([prefix]))  
                   .pipe(sourcemaps.write('./'))
                   .pipe(gulp.dest('./dist/css/'));
  }
  else {  
   stream = stream.pipe(postcss([prefix, mqpacker]))
                  .pipe(minifycss())
                  .pipe(gulp.dest('./dist/css/'))
                  .pipe(pixrem())
                  .pipe(rename({suffix: ".old"}))
                  .pipe(gulp.dest('./dist/css/'));   
  }
  
  return stream.pipe(reload({stream:true}))
               .pipe(notify({ title: 'Gulp: Sass compiled', message: '<%= file.relative %> <%= options.env %>' }));
});


// ******************************
// Lokale webserver
// ******************************
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: './dist/'
    }
  });
});

// ******************************
// Sketch
// ******************************
// Install http://bohemiancoding.com/sketch/tool/
// sketchtool export slices ./src/sketch/design.sketch --output=./dist/images
gulp.task('sketch', function(){
  return gulp.src(path.join(paths.sketch, '*.sketch'))
    .pipe(sketch({
      export: 'slices',
      clean: true
    }))
    .pipe(gulp.dest('./dist/images/'));
});

// ******************************
// Icon font
// ******************************
gulp.task('icon-font', function(){
  var template = 'sass-style';
  
  return gulp.src('./dist/images/icons/*.svg')
    .pipe(iconfont({ fontName: 'icons' }))
    .on('codepoints', function(codepoints) {
      
      var options = {
        glyphs: codepoints,
        fontName: 'icons',
        fontPath: '/fonts/', // set path to font (from your CSS file if relative)
        className: 'icon' // set class name in your CSS
      };
      
      gulp.src('./src/sketch/iconfont-templates/' + template + '.scss')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: '_icons' }))
        .pipe(gulp.dest('./src/css/base/'))
        .on('error', function(error) {
          console.log(error);
          this.emit('end');
        })
      
      gulp.src('./src/sketch/iconfont-templates/partial.jade')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:'icons' }))
        .pipe(gulp.dest('./src/jade/partials/'))
        .on('error', function(error) {
          console.log(error);
          this.emit('end');
        })

      gulp.src('./src/sketch/iconfont-templates/' + template + '.html')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:'index' }))
        .pipe(gulp.dest('./dist/fonts/'))
        .on('error', function(error) {
          console.log(error);
          this.emit('end');
        })
    })
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest('./dist/fonts/'));
});
 
// ******************************
// Default Gulp Task
// ******************************
gulp.task('default', ['scripts',
                      'jade',
                      'sass', 
                      'browser-sync',
                      'images'], function() {
  
  // Watchers
  gulp.watch('./src/jade/**/*.jade', ['jade']);
  gulp.watch(path.join(paths.sass, '**/*.scss'), ['sass']);
  gulp.watch(path.join(paths.scripts, '**/*.js'), ['scripts']);
  gulp.watch(paths.images, ['images']);
});

// ******************************
// Export sketch Gulp Task
// ******************************
gulp.task('export-sketch', ['sketch',
                            'icon-font'], function() {
});

// ******************************
// Install components task
// ******************************
gulp.task('install', ['bower',
                      'preen'], function() {
  
});

// ******************************
// CSS Lint task
// ******************************
var csslint = require('gulp-csslint');
 
gulp.task('css', function() {
  /*csslint adjoining-classes:false */

  gulp.src('dist/css/*.css')
    .pipe(csslint({
      'adjoining-classes': false,
      'box-sizing': false
    }))
    .pipe(csslint.reporter());
});