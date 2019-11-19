const express = require("express");
const app = express();
const db = require("./db");
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const { s3Url } = require("./config");

const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});

app.use(express.static("./public"));

app.use(express.json());

app.get("/images", (req, res) => {
    db.getImage()
        .then(({ rows }) => {
            res.json(rows);
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
});

app.post("/upload", uploader.single("image"), s3.upload, (req, res) => {
    let { username, title, desc } = req.body;
    const url = `${s3Url}${req.file.filename}`;

    db.addImage(url, username, title, desc)
        .then(({ rows }) => {
            console.log(rows);
            res.json({ url, username, title, desc, id: rows[0].id });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
});

app.get("/images/:id", (req, res) => {
    db.nextId(Number(req.params.id))
        .then(res => {
            if (!res.rows[0]) {
                return;
            } else {
                let nextId = res.rows[0].id;
                return nextId;
            }
        })
        .then(nextId => {
            db.lastId(Number(req.params.id))
                .then(res => {
                    if (!res.rows[0]) {
                        return;
                    } else {
                        let lastId = res.rows[0].id;
                        return lastId;
                    }
                })
                .then(lastId => {
                    db.getInfo(Number(req.params.id))
                        .then(({ rows }) => {
                            if (rows[0]) {
                                if (rows[0].comment === null) {
                                    res.json({
                                        info: rows[0],
                                        nextId: nextId,
                                        lastId: lastId
                                    });
                                } else {
                                    res.json({
                                        info: rows[0],
                                        comments: rows,
                                        nextId: nextId,
                                        lastId: lastId
                                    });
                                }
                            } else {
                                res.json(rows);
                            }
                        })
                        .catch(err => {
                            console.log(err);
                            res.sendStatus(500);
                        });
                });
        });
});

app.get("/moreimages/:lastid", (req, res) => {
    db.getMoreImages(Number(req.params.lastid)).then(rows => {
        res.json(rows);
    });
});

app.post("/comment", (req, res) => {
    let { comments_username, comment, id } = req.body;
    db.addComment(comments_username, comment, id)
        .then(({ rows }) => {
            res.json({
                id: rows[0].id,
                comments_username: comments_username,
                comment: comment,
                comments_created_at: rows[0].comments_created_at
            });
        })
        .catch(err => {
            console.log(err);
            res.sendStatus(500);
        });
});

app.post("/delete/:id", (req, res) => {
    db.deleteImage(Number(req.params.id))
        .then(() => db.getImage())
        .then(({ rows }) => {
            res.json(rows);
        });
});

app.get("/*", (req, res) => res.redirect("/"));

app.listen(7070, () => console.log("Listening..."));
