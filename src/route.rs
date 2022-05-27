use futures::future::TryFutureExt;
use futures::stream::TryStreamExt;
use rocket::fairing::AdHoc;
use rocket::futures;
use rocket::http::{ContentType, Cookie, CookieJar};
use rocket::response::status::{BadRequest, Created};
use rocket::response::Responder;
use rocket::serde::json::{serde_json, Json};
use rocket::serde::Serialize;
use rocket_db_pools::{sqlx, Connection};
use sqlx::error::DatabaseError;
use sqlx::sqlite::SqliteError;
use sqlx::Error::Database;

use crate::model::{FeedInfo, LoginForm, SourceFeed, User};
use crate::util::{fetch_rss_info, merge_feeds_data};
use crate::Db;

type Result<T, E = rocket::response::Debug<sqlx::Error>> = std::result::Result<T, E>;

#[post("/", data = "<feed>")]
async fn create(mut db: Connection<Db>, feed: Json<SourceFeed>) -> Result<Created<()>> {
    sqlx::query!(
        "INSERT INTO feeds (name, url, keywords) VALUES (?, ?, ?)",
        feed.name,
        feed.url,
        feed.keywords
    )
    .execute(&mut *db)
    .await?;

    Ok(Created::new("/").body(()))
}

#[get("/")]
async fn list(mut db: Connection<Db>) -> Result<Json<Vec<SourceFeed>>> {
    let feeds = sqlx::query!("SELECT id, name, url, keywords FROM feeds")
        .fetch(&mut *db)
        .map_ok(|r| SourceFeed {
            id: Some(r.id),
            name: r.name,
            url: r.url,
            keywords: r.keywords,
        })
        .try_collect::<Vec<_>>()
        .await?;

    Ok(Json(feeds))
}

#[get("/<id>")]
async fn read(mut db: Connection<Db>, id: i64) -> Option<Json<SourceFeed>> {
    sqlx::query!("SELECT id, name, url, keywords FROM feeds WHERE id = ?", id)
        .fetch_one(&mut *db)
        .map_ok(|r| {
            Json(SourceFeed {
                id: Some(r.id),
                name: r.name,
                url: r.url,
                keywords: r.keywords,
            })
        })
        .await
        .ok()
}

#[delete("/<id>")]
async fn delete(mut db: Connection<Db>, id: i64) -> Result<Option<()>> {
    let result = sqlx::query!("DELETE FROM feeds WHERE id = ?", id)
        .execute(&mut *db)
        .await?;

    Ok((result.rows_affected() == 1).then(|| ()))
}

#[post("/<id>", data = "<feed>")]
async fn update(mut db: Connection<Db>, id: i64, feed: Json<SourceFeed>) -> Result<Option<()>> {
    let result = sqlx::query!(
        "UPDATE feeds SET name = ?, url = ?, keywords = ? WHERE id = ?",
        feed.name,
        feed.url,
        feed.keywords,
        id
    )
    .execute(&mut *db)
    .await?;

    Ok((result.rows_affected() == 1).then(|| ()))
}

#[delete("/")]
async fn destroy(mut db: Connection<Db>) -> Result<()> {
    sqlx::query!("DELETE FROM feeds").execute(&mut *db).await?;

    Ok(())
}

#[get("/fetch?<url>")]
async fn fetch(url: &str) -> Result<Json<FeedInfo>, BadRequest<String>> {
    fetch_rss_info(url, 100)
        .await
        .map(Json)
        .map_err(|e| BadRequest(Some(e.to_string())))
}

#[post("/register", data = "<user>")]
async fn register(mut db: Connection<Db>, user: Json<User>) -> Result<Created<()>, ErrorResponse> {
    let password = user
        .password
        .as_ref()
        .ok_or_else(|| ErrorResponse::BadRequest("Password is None".to_owned()))?;
    let hashed_password = hash_password(password);
    sqlx::query!(
        "INSERT INTO users (email, nickname, password) VALUES (?, ?, ?)",
        user.email,
        user.nickname,
        hashed_password
    )
    .execute(&mut *db)
    .await
    .map_err(|e| {
        if let Database(ref err) = e {
            let err = err.downcast_ref::<SqliteError>();
            if err.code().unwrap() == "2067" {
                return ErrorResponse::BadRequest("Email was registered".to_owned());
            }
        }
        return ErrorResponse::InternalError(e.to_string());
    })?;

    Ok(Created::new("/").body(()))
}

#[post("/login", data = "<user>")]
async fn login(mut db: Connection<Db>, user: Json<LoginForm>, cookie: &CookieJar<'_>) -> Result<(), ErrorResponse> {
    let password = hash_password(&user.password);
    let user = sqlx::query!(
        "SELECT id, email, nickname FROM users WHERE email = ? AND password = ?",
        user.email,
        password
    )
    .fetch_one(&mut *db)
    .await
    .map(|r| User {
        id: r.id,
        nickname: r.nickname,
        email: r.email,
        password: None,
    })
    .map_err(|e| ErrorResponse::InternalError(e.to_string()))?;

    cookie.add_private(Cookie::new("user", serde_json::to_string(&user).unwrap()));
    Ok(())
}

const SALT: &str = "merge into one rss!";

fn hash_password(password: &str) -> Vec<u8> {
    use sha2::Digest;
    let mut hasher = sha2::Sha256::new();
    hasher.update(password.as_bytes());
    hasher.update(SALT.as_bytes());
    hasher.finalize().to_vec()
}

#[derive(Responder)]
enum ErrorResponse {
    #[response(status = 500)]
    InternalError(String),
    #[response(status = 400)]
    BadRequest(String),
}

#[get("/rss?<token>")]
async fn rss(mut db: Connection<Db>, token: &str) -> Result<(ContentType, Vec<u8>), ErrorResponse> {
    let _ = token; // token is not used now. avoid warning

    let feeds: Vec<SourceFeed> = sqlx::query!("SELECT id, name, url, keywords FROM feeds")
        .fetch(&mut *db)
        .map_ok(|r| SourceFeed {
            id: Some(r.id),
            name: r.name,
            url: r.url,
            keywords: r.keywords,
        })
        .try_collect::<Vec<_>>()
        .await
        .map_err(|e| ErrorResponse::InternalError(e.to_string()))?;

    merge_feeds_data(&feeds)
        .await
        .map(|r| (ContentType::XML, r))
        .map_err(|e| ErrorResponse::BadRequest(e.to_string()))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Routes", |rocket| async {
        rocket
            .mount("/api/feeds", routes![list, create, read, update, delete, destroy])
            .mount("/api/", routes![register])
            .mount("/api/", routes![fetch])
            .mount("/", routes![rss])
    })
}
