const aws = require("aws-sdk");
const fs = require("fs");
const im = require("imagemagick");
// const sharp = require("sharp");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET
});

exports.upload = (req, res, next) => {
    if (!req.file) {
        return res.sendStatus(500);
    }
    console.log("this is the file", req.file.path);

    const { filename, mimetype, size, path } = req.file;
    s3.putObject({
        Bucket: "spicedling",
        ACL: "public-read",
        Key: filename,
        Body: fs.createReadStream(path),
        ContentType: mimetype,
        ContentLength: size
    })
        .promise()
        .then(() => {
            // it worked!!!
            next();
        })
        .catch(err => {
            // uh oh
            console.log(err);
            res.sendStatus(500);
        });
};
