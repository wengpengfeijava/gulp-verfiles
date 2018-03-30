const crypto = require('crypto');
const through2 = require('through2');
const path = require('path');
const _ = require('lodash');

/**
 * 执行hash
 * @param str
 * @returns {Blob|ArrayBuffer|Array.<T>|string}
 */
function hash (str = '') {
    return crypto.createHash('md5')
        .update(str)
        .digest('hex').slice(0, 10);
}

/**
 *
 * @param options
 * @param options.src
 * @param options.dist
 */
let hashMapper = {};

function hashFile (options = {}) {
    let changeFiles = [];
    return through2.obj(function (file, enc, next) {

        // 缓存源文件的名称
        file.originPath = file.path;

        // ......
        doHash(options.src, file, hashMapper);

        // 搜集所有文件， 就当所有文件都发生变化了
        changeFiles.push(file);
        next();
    }, function (next) {
        rollingHash.call(this, next);

        // 执行滚动hash
        function rollingHash (next) {

            // 缓存第一次hash过的文件路径映射
            let hashMapperCache = hashMapper;

            // 重置文件映射对象
            hashMapper = {};

            // 将没有变更的文件从文件队列中删除掉
            _.remove(changeFiles, file => file.needRemove);

            changeFiles.forEach((file) => {

                // 如果第一次循环，则将文件扔进流中
                let originalContent = file.contents.toString();
                Object.keys(hashMapperCache)
                    .forEach((mapper) => {
                        let matchReg = new RegExp(jsCompile(mapper));
                        // 进行正则匹配， 如果匹配到就将内容替换， 并且丢进循环组。
                        if (matchReg.test(originalContent)) {
                            originalContent = originalContent.split(matchReg)
                                .join(jsCompile(hashMapperCache[mapper]));
                            file.changed = true;
                        }
                    });
                // 检测到文件内容发生变化， 则将文件重新hash，并且丢进hash列
                if (file.changed) {

                    // 重置变化依据
                    file.changed = false;

                    // 将文件内容重新赋值
                    file.contents = new Buffer(originalContent);

                    // //....
                    doHash(options.src, file, hashMapper);
                } else {
                    file.needRemove = true;
                    this.push(file);
                }
            });

            // 如果变化文件集合中有文件，则递归执行
            if (changeFiles.length) {
                rollingHash.call(this, next);
            } else {
                next();
            }
        }
    });
}

/**
 * 将 js\\xxxx\\xxxx.js 替换成 xxxx\\xxxx
 * @param filePath
 * @returns {XML|string}
 */
function jsCompile (filePath) {
    return filePath
        .replace(/\\+/g, '/')
        .replace(/^js\//, '')
        .replace(/\.js$/, '');
}

/**
 * 执行hash
 * @param src 执行hash的总文件路径
 * @param file
 * @param hashMapper
 */
function doHash (src, file, hashMapper) {

    // 缓存源路径
    let sourcePath = path.relative(src, file.path);

    // 生成hash值
    let hashKeyValue = hash(file.contents.toString());

    // 格式化文件原路径的地址
    let parsedPath = path.parse(file.originPath);

    // 将文件的base替换成已经hash化的文件名字
    parsedPath.base = parsedPath.base.replace(parsedPath.name, `${parsedPath.name}_${hashKeyValue}`);

    // 修改文件名称为源文件名称_hash值
    parsedPath.name = `${parsedPath.name}_${hashKeyValue}`;

    // 添加到文件名称路径的映射
    hashMapper[sourcePath] = path.relative(src, path.format(parsedPath));

    // 重置文件的名称到新的已经hash化的文件名称
    file.path = path.format(parsedPath);
}

module.exports = hashFile;