CREATE TABLE feeds (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       VARCHAR  NOT NULL,
    url        VARCHAR  NOT NULL,
    keywords   VARCHAR  NOT NULL,
    user_id    INTEGER  NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER feeds_update AFTER UPDATE ON feeds
BEGIN
    UPDATE feeds SET updated_at = CURRENT_TIMESTAMP WHERE rowid == NEW.rowid;
END;

CREATE TABLE users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    email      VARCHAR  NOT NULL,
    nickname   VARCHAR  NOT NULL,
    password   VARCHAR  NOT NULL,
    token      VARCHAR  NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX users_email_uindex ON users (email);

CREATE UNIQUE INDEX users_token_uindex ON users (token);

CREATE TRIGGER users_update AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE rowid == NEW.rowid;
END;
