'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    less = require('gulp-less'),
    inlineCss = require('gulp-inline-css'),
    rigger = require('gulp-rigger'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;


var path = {
    build: { //Тут мы укажем куда складывать готовые после сборки файлы
        html:  'build/',
        css:   'build/',
        img:   'build/'
    },
    src: { //Пути откуда брать исходники
        html:  'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        style: 'src/style/**/*.less',
        img:   'src/img/**/*.*' 
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html:  'src/**/*.html',
        style: 'src/style/**/*.less',
        img:   'src/img/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};


gulp.task('html:build', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(inlineCss())
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('style:build', function () {
    gulp.src(path.src.style) //Выберем наш main.css
        .pipe(less()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        //.pipe(gulp.dest(path.build.css)) //И в build
        .pipe(gulp.dest('src/')) // в проект для inlinecss
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({stream: true}));
});


gulp.task('inline', function() {
        gulp.src('src/*.html')
            .pipe(inlineCss())
            .pipe(gulp.dest('build/'));
});


gulp.task('build', [
    'html:build',
    'style:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
        gulp.start('html:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
});


gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);

