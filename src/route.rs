use futures::future::TryFutureExt;
use futures::stream::TryStreamExt;
use rocket::fairing::AdHoc;
use rocket::http::{ContentType, Cookie, CookieJar};
use rocket::request::FromRequest;
use rocket::response::status::Created;
use rocket::serde::json::{serde_json, Json};
use rocket::{futures, request, Request};
use rocket_db_pools::{sqlx, Connection};
use sqlx::error::DatabaseError;
use sqlx::sqlite::SqliteError;

use crate::error::{Error, Result};
use crate::model::{FeedInfo, LoginForm, SourceFeed, User};
use crate::util::{fetch_rss_info, merge_feeds_data};
use crate::Db;

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
async fn list(mut db: Connection<Db>, user: User) -> Result<Json<Vec<SourceFeed>>> {
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
async fn fetch(url: &str) -> Result<Json<FeedInfo>> {
    fetch_rss_info(url, 100).await.map(Json)
}

#[post("/register", data = "<user>")]
async fn register(mut db: Connection<Db>, user: Json<User>) -> Result<()> {
    let password = user
        .password
        .as_ref()
        .ok_or_else(|| Error::Custom("Password is None".to_owned()))?;
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
        if let sqlx::Error::Database(ref err) = e {
            let err = err.downcast_ref::<SqliteError>();
            if err.code().unwrap() == "2067" {
                return Error::Custom("Email was registered".to_owned());
            }
        }
        return e.into();
    })?;

    Ok(())
}

#[post("/login", data = "<user>")]
async fn login(mut db: Connection<Db>, user: Json<LoginForm>, cookie: &CookieJar<'_>) -> Result<()> {
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
    .map_err(|e| match e {
        sqlx::Error::RowNotFound => Error::Custom("Incorrect user or password".to_owned()),
        _ => e.into(),
    })?;

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

#[rocket::async_trait]
impl<'r> FromRequest<'r> for User {
    type Error = std::convert::Infallible;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<User, Self::Error> {
        use crate::rocket::outcome::IntoOutcome;
        request
            .cookies()
            .get_private("user")
            .and_then(|cookie| serde_json::from_str(cookie.value()).unwrap())
            .or_forward(())
    }
}

#[get("/user")]
async fn user(user: User) -> Result<Json<User>> {
    Ok(Json(user))
}

#[get("/user", rank = 2)]
async fn user_no_auth(user: User) -> Result<Json<User>> {
    Err(Error::Unauthorized)
}

#[post("/logout")]
async fn logout(cookie: &CookieJar<'_>) -> Result<()> {
    cookie.remove_private(Cookie::named("user"));
    Ok(())
}

#[get("/rss?<token>")]
async fn rss(mut db: Connection<Db>, token: &str) -> Result<(ContentType, Vec<u8>)> {
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
        .await?;

    merge_feeds_data(&feeds).await.map(|r| (ContentType::XML, r))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Routes", |rocket| async {
        rocket
            .mount("/api/feeds", routes![list, create, read, update, delete, destroy])
            .mount("/api/", routes![register, login, user, user_no_auth, logout])
            .mount("/api/", routes![fetch])
            .mount("/", routes![rss])
    })
}
