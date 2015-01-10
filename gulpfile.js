var gulp = require('gulp'),
    sketch = require('gulp-sketch'),
    fm = require('front-matter'),
    data = require('gulp-data'),
    jade = require('gulp-jade'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    notify = require('gulp-notify'),
    imagemin = require('gulp-imagemin'),
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
    deploy = require('gulp-gh-pages');
 
var paths = {
  templates: './src/jade/',
  sass: './src/css/',
  sketch: './src/sketch/',
  images: './src/images/**/*',
  scripts: './src/js/'
};

// Clean: remove all build output
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  del(['dist'], cb);
});

// Bower: install components
gulp.task('bower', function() {
  return bower()
});

// Preen: clean Bower components
gulp.task('preen', ['bower'], function(cb) {
  preen.preen({}, cb);
});

// Scripts: Uglify, concat
gulp.task('scripts', function() {
  return gulp.src(path.join(paths.scripts, '**/*.js'))
    .pipe(sourcemaps.init())
    .pipe(concat('interpolis.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js'))
    .pipe(notify({ title: 'Gulp: scripts updated', message: '<%= file.relative %>' }));
});
  
// Jade: grab partials from templates and render out html files
gulp.task('jade', function() {
  gulp.src(['./src/jade/**/*.jade', '!./src/jade/layout/*.jade'])    
   
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
    
// Images static images
gulp.task('images', function() {
  gulp.src(paths.images)
    // Pass in options to the task
    .pipe(newer('./dist/images/'))
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('./dist/images/'))
    .pipe(reload({stream:true}));
});

// Compass: compile sass to css
gulp.task('compass', function() {
  gulp.src(path.join(paths.sass, '**/*.scss'))
    .pipe(newer('./dist/css/'))
    .pipe(sass({compass: true, require: ['susy']}))
    .on('error', function(error) {
      // Would like to catch the error here
      console.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest('./dist/css/'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(minifycss())
    .pipe(gulp.dest('./dist/css/'))
    .pipe(reload({stream:true}))
    .pipe(notify({ title: 'Gulp: Sass compiled', message: '<%= file.relative %>' }));
});


// Browser-sync: Local webserver
gulp.task('browser-sync', ['compass'], function() {
  browserSync({
    server: {
      baseDir: './dist/'
    }
  });
});

// Sketch: export sketch slice
// Install http://bohemiancoding.com/sketch/tool/
gulp.task('sketch', function(){
  return gulp.src(path.join(paths.sketch, '*.sketch'))
    .pipe(sketch({
      export: 'slices',
      clean: true
    }))
    .on('error', function(error) {
      console.log(error);
      this.emit('end');
    })
    .pipe(gulp.dest('./dist/images/'));
});

gulp.task('icon-font', ['sketch'], function(){
  var template = 'sass-style';
  
  return gulp.src('./dist/images/icons/*.svg')
    .pipe(iconfont({ fontName: 'interpolis-icons' }))
    .on('codepoints', function(codepoints) {
      
      var options = {
        glyphs: codepoints,
        fontName: 'interpolis-icons',
        fontPath: '/fonts/', // set path to font (from your CSS file if relative)
        className: 'icon' // set class name in your CSS
      };
      
      gulp.src('./src/sketch/iconfont-templates/' + template + '.scss')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: '_icons' }))
        .pipe(gulp.dest('./src/css/interpolis/base/'))
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
 
// Default Gulp Task
gulp.task('default', ['bower',
                      'images',
                      'scripts',
                      'jade',
                      'compass', 
                      'preen', 
                      'browser-sync'], function() {
  
  // Watchers
  gulp.watch(path.join(paths.templates, '**/*.jade'), ['jade']);
  gulp.watch(path.join(paths.sass, '**/*.scss'), ['compass']);
  gulp.watch(path.join(paths.scripts, '**/*.js'), ['scripts']);
  gulp.watch(paths.images, ['images']);
});

// Default Gulp Task
gulp.task('export-sketch', ['sketch',
                            'icon-font'], function() {
});
 
// Deploy to github pages
gulp.task('deploy', function () {
  return gulp.src('./dist/**/*')
    .pipe(deploy())
});