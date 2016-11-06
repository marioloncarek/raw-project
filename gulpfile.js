// UTILITIES
var gulp = require('gulp');
var rename = require("gulp-rename");
var order = require("gulp-order");
var del = require('del');
var vinylPaths = require('vinyl-paths');
var cache = require('gulp-cached');
// CSS
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var purify = require('gulp-purifycss');
var cleanCSS = require('gulp-clean-css');
var csscomb = require('gulp-csscomb');
var cssbeautify = require('gulp-cssbeautify');
// HTML
var htmlreplace = require('gulp-html-replace');
var htmlmin = require('gulp-htmlmin');
var w3cjs = require('gulp-w3cjs');
var sitemap = require('gulp-sitemap');
// JS
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
// IMAGES
var imagemin = require('gulp-imagemin');
var svgSprite = require('gulp-svg-sprite');
// SERVER
var browserSync = require('browser-sync');
var reload = browserSync.reload;


/*
 INSTALLS
 - Installing plugins commands
 */

//INSTALL GULP LOCALLY
//npm install --save-dev gulp

//LOCAL AND GLOBAL DEV DEPENDENCIES INSTALL COMMANDS:
//npm install --save-dev gulp-sass gulp-sourcemaps gulp-html-replace gulp-order gulp-sitemap gulp-concat gulp-autoprefixer gulp-clean-css gulp-uglify jshint gulp-jshint gulp-purifycss gulp-cssbeautify gulp-csscomb gulp-rename gulp-htmlmin gulp-w3cjs del gulp-cached vinyl-paths browser-sync gulp-svg-sprite gulp-imagemin
//npm install -g gulp-sass gulp-sourcemaps gulp-html-replace gulp-order gulp-sitemap gulp-concat gulp-autoprefixer gulp-clean-css gulp-uglify jshint gulp-jshint gulp-purifycss gulp-cssbeautify gulp-csscomb gulp-rename gulp-htmlmin gulp-w3cjs del gulp-cached vinyl-paths browser-sync gulp-svg-sprite gulp-imagemin

//IMAGEMIN WANTS TO FAIL AT INSTALL AND NEEDS REINSTALL:
//npm cache clear
//npm install gulp-imagemin --save-dev

//INSTALL FROM DEV DEPENDENCIES:
//npm install

//UPDATE FROM DEV DEPENDENCIES:
//npm update
//npm update --save
//npm outdated

/*
 END INSTALLS
 */


/*
 DEVELOPMENT
 - create svg sprites, compile scss, validate js and html and start server with BrowserSync
 */

//svgsprite - create sprites from svg files, not in task, run on its own
gulp.task('svgsprite', function () {
    gulp.src('src/static/svgsprites/icons/*.svg')
        .pipe(svgSprite({
            shape: {
                dimension: { // Set maximum dimensions
                    maxWidth: 32,
                    maxHeight: 32
                }
            },
            svg: {
                xmlDeclaration: false, // Strip out the XML attribute
                doctypeDeclaration: false // Don't include the !DOCTYPE declaration
            },
            mode: {
                view: { // Activate the «view» mode
                    dest: '',
                    sprite: 'view-svg-sprite.svg', // Sprite name
                    example: true, // Build sample page
                    prefix: '.icon-view-',
                    bust: false,
                    render: {
                        scss: {
                            dest: '../scss/vendors/_view-svg-sprite.scss', // Name of scss file (in /scss/vendors/ folder)
                            template: 'src/static/svgsprites/templates/css-svg-sprite-template' // Path to scss template
                        }
                    }
                },
                css: { // Activate the «css» mode
                    dest: '',
                    sprite: 'css-svg-sprite.svg', // Sprite name
                    example: true, // Build sample page
                    prefix: '.icon-',
                    bust: false,
                    render: {
                        scss: {
                            dest: '../scss/vendors/_css-svg-sprite.scss', // Name of scss file (in /scss/vendors/ folder)
                            template: 'src/static/svgsprites/templates/css-svg-sprite-template' // Path to scss template
                        }
                    }
                },
                symbol: { // Activate the «symbol» mode
                    dest: '',
                    sprite: 'symbol-svg-sprite.svg', // Sprite name
                    example: true, // Build sample page
                    prefix: '.symbol-',
                    bust: false,
                    render: {
                        scss: {
                            dest: '../scss/vendors/_symbol-svg-sprite.scss' // Name of scss file (in /scss/vendors/ folder)
                        }
                    }
                },
                defs: { // Activate the «defs» mode
                    dest: '',
                    sprite: 'defs-svg-sprite.svg', // Sprite name
                    example: true, // Build sample page
                    prefix: '.defs-',
                    bust: false,
                    render: {
                        scss: {
                            dest: '../scss/vendors/_defs-svg-sprite.scss' // Name of scss file (in /scss/vendors/ folder)
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest('src/static/svgsprites/'));
});

//scss - compile SCSS, uncss it, autoprefix it, comb beautify it and create sourcemaps
gulp.task('scss', function () {
    return gulp.src('src/static/scss/style.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 10 versions', 'IE 9']
        }))
        .pipe(csscomb())
        .pipe(cssbeautify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('src/static/css/'))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }));
});

//html - validate HTML with w3cjs
gulp.task('html', function () {
    gulp.src('src/**/*.html')
        .pipe(cache('html-validation'))
        .pipe(w3cjs())
        .pipe(reload({stream: true}));
});

//jshint - validate JS with jshint
gulp.task('jshint', function () {
    return gulp.src('src/static/js/*.js')
        .pipe(cache('js-hint'))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(reload({stream: true}));
});

//DEFAULT - run task with: gulp, open server, watch for changes
gulp.task('default', ['scss', 'html', 'jshint'], function () {
    browserSync({
        server: {
            baseDir: 'src/'
        },
        // Will not attempt to determine your network status, assumes you're ONLINE
        online: true
    });

    gulp.watch('src/static/scss/**/*.scss', ['scss']);
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/static/js/**/*.js', ['jshint']);
});

/*
 END DEVELOPMENT
 */


/*
 BUILD PROCESS
 - builds the project in /dist folder
 */

//clear:dist - delete dist files in the stream
gulp.task('clear:dist', function () {
    return gulp.src('dist/*', {dot: true})
        .pipe(vinylPaths(del));
});

//compile:css - compile SCSS, uncss it, autoprefix it and minify it [after clearing dist]
gulp.task('compile:css', ['clear:dist'], function () {
    return gulp.src('src/static/scss/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(purify(['src/static/js/*.js', 'src/*.html']))
        .pipe(autoprefixer({
            browsers: ['last 10 versions', 'IE 9']
        }))
        .pipe(csscomb())
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist/static/css/'))
});

//compress:html - minify html and replace html blocks of js with concated js file [after clearing dist]
gulp.task('compress:html', ['clear:dist'], function () {
    gulp.src('src/*.html')
        .pipe(htmlreplace({
            'js': 'static/js/bundle.min.js'
        }))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist/'));
});

//concat:js - merge js to one and minifył [after clearing dist]
gulp.task('concat:js', ['clear:dist'], function () {
    return gulp.src(['src/static/js/**/*.js', '!src/static/js/fallback{,/**/*}'])
        .pipe(order([
            "vendors/**/*.js",
            "*.js",
            "main.js"
        ]))
        .pipe(concat('bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/static/js/'));
});

//compress:images - optimize images [after clearing dist]
gulp.task('compress:images', ['clear:dist'], function () {
    return gulp.src('src/static/images/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/static/images/'));
});

//create:favicon - rename favicon.png to favicon.ico [after clearing dist]
gulp.task('create:favicon', ['clear:dist'], function () {
    gulp.src("src/favicon.png")
        .pipe(imagemin())
        .pipe(rename("favicon.ico"))
        .pipe(gulp.dest("dist/"));
});

//copy:project:files - copy all files needed for site to dist [after main tasks]
gulp.task('copy:project:files', ['compile:css', 'compress:html', 'concat:js', 'compress:images'], function () {
    return gulp
        .src(['src/*.+(txt|js|xml|pdf|zip|gz)', 'src/.*'], {dot: true})
        .pipe(gulp.dest('dist/'));
});

//generate:sitemap - generate sitemap from html files [after main tasks]
gulp.task('generate:sitemap', ['compile:css', 'compress:html', 'concat:js', 'compress:images'], function () {
    gulp.src('dist/*.html')
        .pipe(sitemap({
            siteUrl: 'http://project-url.com'
        }))
        .pipe(gulp.dest('dist/'));
});

//copy:fonts - copy fonts folder to dist [after main tasks]
gulp.task('copy:fonts', ['compile:css', 'compress:html', 'concat:js', 'compress:images'], function () {
    return gulp
        .src('src/static/fonts/**/*')
        .pipe(gulp.dest('dist/static/fonts/'));
});

//copy:fallback - copy fallback folder of JS to dist [after main tasks]
gulp.task('copy:fallback', ['compile:css', 'compress:html', 'concat:js', 'compress:images'], function () {
    return gulp
        .src('src/static/js/fallback/**/*')
        .pipe(gulp.dest('dist/static/js/fallback/'));
});

//copy:svg:sprites - copy sprites folder [after main tasks]
gulp.task('copy:svg:sprites', ['compile:css', 'compress:html', 'concat:js', 'compress:images'], function () {
    return gulp
        .src('src/static/svgsprites/*.svg')
        .pipe(gulp.dest('dist/static/svgsprites/'));
});

//copy:scss:folder - copy scss folder to dist (not needed for project, just for future maintenance) [after main tasks]
gulp.task('copy:scss:folder', ['compile:css', 'compress:html', 'concat:js', 'compress:images'], function () {
    return gulp
        .src('src/static/scss/**/*')
        .pipe(gulp.dest('dist/static/scss/'));
});

//BUILD - run task with: gulp build
gulp.task('build', ['clear:dist', 'compile:css', 'compress:html', 'concat:js', 'compress:images', 'create:favicon', 'copy:project:files', 'generate:sitemap', 'copy:fonts', 'copy:fallback', 'copy:svg:sprites', 'copy:scss:folder'], function () {
});

/*
 END THE BUILD PROCESS
 */