use crate::Db;

use rocket::{Rocket, Build, futures};
use rocket::fairing::{self, AdHoc};
use rocket::response::status::Created;
use rocket::serde::{Serialize, Deserialize, json::Json};

use rocket_db_pools::{sqlx, Database, Connection};

use futures::{stream::TryStreamExt, future::TryFutureExt};

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
    sqlx::query!("INSERT INTO sources (name, url, keywords) VALUES (?, ?, ?)", feed.name, feed.url, feed.keywords)
        .execute(&mut *db)
        .await?;

    Ok(Created::new("/").body(()))
}

#[get("/")]
async fn list(mut db: Connection<Db>) -> Result<Json<Vec<i64>>> {
    let ids = sqlx::query!("SELECT id FROM sources")
        .fetch(&mut *db)
        .map_ok(|record| record.id)
        .try_collect::<Vec<_>>()
        .await?;

    Ok(Json(ids))
}

#[get("/<id>")]
async fn read(mut db: Connection<Db>, id: i64) -> Option<Json<SourceFeed>> {
    sqlx::query!("SELECT id, name, url, keywords FROM sources WHERE id = ?", id)
        .fetch_one(&mut *db)
        .map_ok(|r| Json(SourceFeed { id: Some(r.id), name: r.name, url: r.url, keywords: r.keywords }))
        .await
        .ok()
}

#[delete("/<id>")]
async fn delete(mut db: Connection<Db>, id: i64) -> Result<Option<()>> {
    let result = sqlx::query!("DELETE FROM sources WHERE id = ?", id)
        .execute(&mut *db)
        .await?;

    Ok((result.rows_affected() == 1).then(|| ()))
}

#[delete("/")]
async fn destroy(mut db: Connection<Db>) -> Result<()> {
    sqlx::query!("DELETE FROM sources").execute(&mut *db).await?;

    Ok(())
}

pub fn stage() -> AdHoc {
    AdHoc::on_ignite("Feeds", |rocket| async {
        rocket.mount("/api/feeds", routes![list, create, read, delete, destroy])
    })
}