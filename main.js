var http = require("http");
var fs = require("fs");
var url = require("url");
var qs = require("querystring");
var path = require("path");
var sanitizeHtml = require('sanitize-html');

var template = require("./lib/template.js");

var app = http.createServer(function (request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    // 메인 페이지
    if (pathname === "/") {
        // Home
        if (queryData.id === undefined) {
            fs.readdir("./data", function (error, filelist) {
                var title = "Welcome";
                var description = "Hello, Node.js";
                var list = template.list(filelist);
                var html = template.html(
                    title,
                    list,
                    `<h2>${title}</h2> <pre>${description}</pre>`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
            // 게시글 조회 (Read)
        } else {
            fs.readdir("./data", function (error, filelist) {
                var filteredPathId = path.parse(queryData.id).base; // 보안
                fs.readFile(
                    `data/${filteredPathId}`,
                    "utf8",
                    function (err, description) {
                        var title = queryData.id;
                        var sanitizedTitle = sanitizeHtml(title);
                        var sanitizedDescription = sanitizeHtml(description,{
                            allowedTags:['h1']
                        });
                        var list = template.list(filelist);
                        var html = template.html(
                            sanitizedTitle,
                            list,
                            `<h2>${sanitizedTitle}</h2> <pre>${sanitizedDescription}</pre>`,
                            `<a href="/create">create</a>
                            <a href="/update?id=${encodeURIComponent(sanitizedTitle)}">
                            update</a>
                            <form action="delete_process" method="post">
                            <input type="hidden" name="id" value="${sanitizedTitle}">
                                <input type="submit" value="delete">
                            </form>
                            `
                        );
                        response.writeHead(200);
                        response.end(html);
                    }
                );
            });
        }
        // 게시글 생성 (Create)
    } else if (pathname === "/create") {
        fs.readdir("./data", function (error, filelist) {
            var title = "WEB - create";
            var list = template.list(filelist);
            var html = template.html(
                title,
                list,
                `
                <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p>
                    <input type="submit">
                </p>
                </form>
                `,
                ""
            );
            response.writeHead(200);
            response.end(html);
        });
        // 게시글 생성 후 리다이렉션
    } else if (pathname === "/create_process") {
        var body = "";
        request.on("data", function (data) {
            body = body + data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, "utf8", function (err) {
                response.writeHead(302, {
                    Location: `/?id=${encodeURIComponent(title)}`,
                });
                response.end();
            });
        });
        // 게시글 수정 (Update)
    } else if (pathname === "/update") {
        fs.readdir("./data", function (error, filelist) {
            var filteredPathId = path.parse(queryData.id).base; // 보안
            fs.readFile(
                `data/${filteredPathId}`,
                "utf8",
                function (err, description) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.html(
                        title,
                        list,
                        `
                        <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${description}</textarea>
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                        </form>
                        `,
                        `<a href="/create">create</a> <a href="/update?id=${encodeURIComponent(
                            title
                        )}">update</a>`
                    );
                    response.writeHead(200);
                    response.end(html);
                }
            );
        });
        // 게시글 수정 후 리다이렉션
    } else if (pathname === "/update_process") {
        var body = "";
        request.on("data", function (data) {
            body = body + data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function (error) {
                fs.writeFile(
                    `data/${title}`,
                    description,
                    "utf8",
                    function (err) {
                        response.writeHead(302, {
                            Location: `/?id=${encodeURIComponent(title)}`,
                        });
                        response.end();
                    }
                );
            });
        });
        // 게시글 삭제 (Delete)
    } else if (pathname === "/delete_process") {
        var body = "";
        request.on("data", function (data) {
            body = body + data;
        });
        request.on("end", function () {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base; // 보안
            fs.unlink(`data/${filteredId}`, function (error) {
                response.writeHead(302, { Location: `/` });
                response.end();
            });
        });
        // 잘못된 경로
    } else if (pathname === "/style.css") {
        fs.readFile("style.css", function (error, data) {
            response.writeHead(200, { "Content-Type": "text/css" });
            response.end(data);
        });
    }else {
        response.writeHead(404);
        response.end("Not found");
    }
});
app.listen(3000);
