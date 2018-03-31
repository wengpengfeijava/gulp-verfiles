# 处理以requirejs + gulp为项目的文件hash化方案

## `node v6+`

## 使用方式

> `npm install gulp-verfiles`

```javascript
    var gulpVerFiles = require('gulp-verfiles');

    gulp.task('test', () => {
        return gulp.src("./src")

        .pipe(gulpVerFiles({
            src: path.resolve(__dirname, './src')
        }))

        .pipe(gulp.dest("./dist"))
    })
```

## 执行前

- src
    - imgs
        - logo.png
    - scripts
        - user
            - index.js
        - order
            - index.js
    - app.js

1. app.js

```javascript
    var orderIndex = "scripts/order/index.js";
    var userIndex = "scripts/user/index.js";
```

## 执行后

- src
    - imgs
        - logo_85mfnsk1e.png
    - scripts
        - user
            - index_k3nmfk3m.js
        - order
            - index_kljn3k45.js
    - app_jm4m5j12m34.js

- app_jm4m5j12m34.js

```javascript
    var orderIndex = "scripts/order/index_kljn3k45.js";
    var userIndex = "scripts/user/index_k3nmfk3m.js";
```

## 参数

### src

==必须==

要执行的文件目录

### License
Apache Licene 2.0
