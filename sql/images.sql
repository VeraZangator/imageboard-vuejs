DROP TABLE IF EXISTS images CASCADE;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    comments_username VARCHAR(30) NOT NULL CHECK (comments_username !=''),
    comment VARCHAR NOT NULL CHECK (comment !=''),
    image_id INT REFERENCES images(id) ON DELETE CASCADE NOT NULL ,
    comments_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
