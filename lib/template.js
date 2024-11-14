module.exports = {
    // 기본 템플릿 생성
    html: function (title, list, body, control) {
        return `
    <!doctype html>
    <html>
    <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="/style.css">
    </head>
    <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
    </body>
    </html>
`;
    },
    // 글 목록 템플릿 생성
    list: function (filelist) {
        var list = "<ul>";
        var i = 0;
        while (i < filelist.length) {
            list =
                list +
                `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list + "</ul>";
        return list;
    },
};

module.exports;
