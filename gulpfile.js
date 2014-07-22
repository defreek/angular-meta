var gulp    = require('gulp')
  , plugins = require('gulp-load-plugins')({lazy:false});

gulp.task('appJS', function(){
    //combine all js files of the app
    gulp.src(['!./app/**/*_test.js','./app/**/*.js'])
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.concat('app.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('metaJS', function(){
    gulp.src(['./src/angular-meta.js'])
        .pipe(plugins.imports())
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter('default'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('templates',function(){
    //combine all template files of the app into a js file
    gulp.src(['!./app/index.html',
        './app/**/*.html'])
        .pipe(plugins.angularTemplatecache('templates.js',{standalone:true}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('css', function(){
    gulp.src('./app/**/*.css')
        .pipe(plugins.concat('app.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('vendorJS', function(){
    //concatenate vendor JS files
    gulp.src(['!./bower_components/**/*.min.js',
        './bower_components/**/*.js'])
        .pipe(plugins.concat('lib.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('vendorCSS', function(){
    //concatenate vendor CSS files
    gulp.src(['!./bower_components/**/*.min.css',
        './bower_components/**/*.css'])
        .pipe(plugins.concat('lib.css'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-index', function() {
    gulp.src('./app/index.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch',function(){
    gulp.watch([
        './dist/**/*.html',
        './dist/**/*.js',
        './dist/**/*.css'
    ], function(event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });

    gulp.watch(['./src/**/*.js'], ['metaJS']);
    gulp.watch(['./app/**/*.js'], ['appJS']);
    gulp.watch(['!./app/index.html','./app/**/*.html'],['templates']);
    gulp.watch('./app/**/*.css',['css']);
    gulp.watch('./app/index.html',['copy-index']);
});

gulp.task('connect', plugins.connect.server({
    root: ['dist'],
    port: 9000,
    livereload: true
}));

gulp.task('clean', function() {
  return gulp.src(['./dist'], {read: false})
    .pipe(plugins.clean());
});

gulp.task('test', function() {
  // Run unit tests.
  return gulp.src('tests/unit/**/*.js', {read: false})
        .pipe(plugins.mocha({ reporter: 'nyan' }));
  // @todo run web tests.
});

gulp.task('default', ['clean'], function() {
  gulp.start('connect','appJS','metaJS','templates','css','copy-index','vendorJS','vendorCSS','watch');
});