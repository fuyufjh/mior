use crate::Db;

use rocket::{futures};
use rocket::fairing::{AdHoc};
use rocket::response::status::{BadRequest, Created};
use rocket::serde::{Serialize, Deserialize, json::Json};

use rocket_db_pools::{sqlx, Database, Connection};

use futures::{stream::TryStreamExt, future::TryFutureExt};
use crate::util::fetch::fetch_rss_info;
use crate::model::FeedInfo;

type Result<T, E = rocket::response::Debug<sqlx::Error>> = std::result::Result<T, E>;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(crate = "rocket::serde")]
struct SourceFeed {
    #[serde(skip_deserializing, skip_serializing_if = "Option::is_none")]
    id: Option<i64>,
    name: String,
    url: String,
    keywords: String,
}

#[post("/", data = "<feed>")]
async fn create(mut db: Connection<Db>, feed: Json<SourceFeed>) -> Result<Created<()>> {
    sqlx::query!("INSERT INTO feeds (name, url, keywords) VALUES (?, ?, ?)", feed.name, feed.url, feed.keywords)
        .execute(&mut *db)
        .await?;

    Ok(Created::new("/").body(()))
}

#[get("/")]
async fn list(mut db: Connection<Db>) -> Result<Json<Vec<SourceFeed>>> {
    let feeds = sqlx::query!("SELECT id, name, url, keywords FROM feeds")
        .fetch(&mut *db)
        .map_ok(|r| SourceFeed { id: Some(r.id), name: r.name, url: r.url, keywords: r.keywords } )
        .try_collect::<Vec<_>>()
        .await?;

    Ok(Json(feeds))
}

#[get("/<id>")]
async fn read(mut db: Connection<Db>, id: i64) -> Option<Json<SourceFeed>> {
    sqlx::query!("SELECT id, name, url, keywords FROM feeds WHERE id = ?", id)
        .fetch_one(&mut *db)
        .map_ok(|r| Json(SourceFeed { id: Some(r.id), name: r.name, url: r.url, keywords: r.keywords }))
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
    let result = sqlx::query!("UPDATE feeds SET name = ?, url = ?, keywords = ? WHERE id = ?",
            feed.name, feed.url, feed.keywords, id)
        .execute(&mut *db)
        .await?;

    Ok((result.rows_affected() == 1).then(|| ()))
}

#[delete("/")]
async fn destroy(mut db: Connection<Db>) -> Result<()> {
    sqlx::query!("DELETE FROM feeds").execute(&mut *db).await?;

    Ok(())
}

#[get("/?<url>")]
async fn fetch(url: &str) -> Result<Json<FeedInfo>, BadRequest<String>> {
    fetch_rss_info(url).await.map_err(|e| BadRequest(Some(e.to_string())))
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Routes", |rocket| async {
        rocket
            .mount("/api/feeds", routes![list, create, read, update, delete, destroy])
            .mount("/api/fetch", routes![fetch])
    })
}
