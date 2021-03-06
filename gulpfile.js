const { src, dest } = require('gulp');
const gulp =  require('gulp');
const fileinclude = require('gulp-file-include');
const del =require('del');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const cleanCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const browsersync = require('browser-sync').create();
const ejs = require("gulp-ejs");

const projectFolder = require('path').join(__dirname, "./dist/build/Leon_page");
const srcFolder = "src";
const path = {
    build: {
        html: projectFolder+"/",
        css: projectFolder+"/css/",
        img: projectFolder+"/img/",
        fonts: projectFolder+"/fonts/",
    },
    src: {
        ejs: [srcFolder+"/*.ejs", "!"+srcFolder+"/_*.ejs"],
        css: srcFolder+"/scss/*.scss",
        img: srcFolder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
        fonts: srcFolder+"/fonts/*.ttf",
    },
    watch: {
        ejs: srcFolder+"/**/*.ejs",
        css: srcFolder+"/scss/**/*.scss",
        img: srcFolder+"/img/**/*.{jpg,png,svg,gif,ico,webp}",
    },
    clean: "./" + projectFolder + "/"
}

function browserSync() {
  browsersync.init({
      server:{
          baseDir: projectFolder + "/"
      },
      port: 3000,
      notify: false
  })
};

function htmlCreate() {
    return src(path.src.ejs)
        .pipe(fileinclude())
        .pipe(
            rename({ 
                extname: ".html" 
            })
        )       
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
};

function cssCreate() {
    return src(path.src.css)
        .pipe(scss({
            includePaths: ['./node_modules'],
        }))
        .pipe(
            scss({
                outputStyle: 'expanded'
            }).on('error', scss.logError)
        )
        .pipe(groupMedia())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"]
            })
        )
        .pipe(cleanCss())
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
};

function imagesCreate() {
    return src(path.src.img)
        .pipe(imagemin({
            interlaced: true, 
            optimizationLevel: 3, 
            progressive: true
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
};

function fontsCreate() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
        .pipe(browsersync.stream())
};

function watchFiles() {
    gulp.watch([path.watch.ejs], htmlCreate);
    gulp.watch([path.watch.css], cssCreate);
    gulp.watch([path.watch.img], imagesCreate);
};

function clean() {
    return del(path.clean);
};

const build = gulp.series(clean, gulp.parallel(cssCreate, htmlCreate, imagesCreate, fontsCreate));
const watch = gulp.parallel(build, watchFiles, browserSync);


exports.build = build;
exports.fontsCreate = fontsCreate;
exports.imagesCreate = imagesCreate;
exports.cssCreate = cssCreate;
exports.htmlCreate = htmlCreate;
exports.watch = watch;
exports.default = watch;