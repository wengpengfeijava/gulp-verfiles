# 处理以requirejs + gulp为项目的文件hash化方案

## `node v6+`

## 使用方式

> `npm install gulp-hashfiles`

```javascript
    var gulpHashFiles = require('gulp-hashfiles');

    gulp.task('test', () => {
        return gulp.src("./src")

        .pipe(gulpHashFiles({
            src: path.resolve(__dirname, './src')
        }))

        .pipe(gulp.dest("./dist"))
    })
```

## 参数

### src

==必须==

要执行的文件目录