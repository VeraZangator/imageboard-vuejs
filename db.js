const spicedPg = require("spiced-pg");
// const secrets = require("./secrets");
// const db = spicedPg("postgres://${secrets.user}:${secrets.password}@localhost:5432/signatures");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres://postgres:postgres@localhost:5432/imageboard"
);

module.exports.getImage = () => {
    return db.query(
        `
        SELECT * FROM images
        ORDER BY id DESC
        LIMIT 10
        `
    );
};

// ORDER BY id DESC

module.exports.addImage = (url, username, title, desc) => {
    return db.query(
        `
        INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [url, username, title, desc]
    );
};

module.exports.getInfo = id => {
    return db.query(
        `
        SELECT *
        FROM comments
        FULL OUTER JOIN images
        ON images.id = comments.image_id
        WHERE images.id=$1
        ORDER BY comments.id DESC
        `,
        [id]
    );
};

module.exports.nextId = id => {
    return db.query(
        `
        SELECT id FROM images
        AS nextid
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 1
        `,
        [id]
    );
};

module.exports.lastId = id => {
    return db.query(
        `
        SELECT id FROM images
        AS lastid
        WHERE id > $1
        ORDER BY id ASC
        LIMIT 1
        `,
        [id]
    );
};

module.exports.addComment = (comments_username, comment, image_id) => {
    return db.query(
        `
        INSERT INTO comments (comments_username, comment, image_id)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [comments_username, comment, image_id]
    );
};

exports.getMoreImages = lastId => {
    return db.query(
        `
        SELECT *, (
        SELECT id FROM images
        ORDER BY id ASC
        LIMIT 1
        )
        AS lowest_id FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 10`,
        [lastId]
    );
};

module.exports.deleteComment = id => {
    return db.query(
        `
        DELETE FROM comments
        WHERE id = $1
        `,
        [id]
    );
};

module.exports.deleteImage = id => {
    return db.query(
        `
        DELETE FROM images CASCADE
        WHERE id = $1
        `,
        [id]
    );
    // .then(() => {
    //     `SELECT * FROM images
    //     ORDER BY id DESC
    //     LIMIT 10`;
    // });
};

// module.exports.getInfo = id => {
//     return db.query(
//         `
//         SELECT *
//         FROM images
//         WHERE id = $1
//         `,
//         [id]
//     );
// };
//
// module.exports.showComments = id => {
//     return db.query(
//         `
//         SELECT comments_username, comment, comments_created_at FROM comments
//         WHERE image_id = $1
//         `,
//         [id]
//     );
// };
