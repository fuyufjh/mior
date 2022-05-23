#[macro_use] extern crate rocket;

use rocket::{Build, fairing, Rocket};
use rocket::fairing::AdHoc;
use rocket::fs::FileServer;
use rocket_db_pools::{sqlx, Database};

mod feed;

#[derive(Database)]
#[database("sqlx")]
pub struct Db(sqlx::SqlitePool);

#[launch]
fn rocket() -> _ {
    rocket::build()
        .attach(Db::init())
        .attach(AdHoc::try_on_ignite("Run Migrations", run_migrations))
        .mount("/", FileServer::from("./frontend/out"))
        .attach(feed::stage())
}

async fn run_migrations(rocket: Rocket<Build>) -> fairing::Result {
    match Db::fetch(&rocket) {
        Some(db) => match sqlx::migrate!("db/migrations").run(&**db).await {
            Ok(_) => Ok(rocket),
            Err(e) => {
                error!("Failed to initialize SQLx database: {}", e);
                Err(rocket)
            }
        }
        None => Err(rocket),
    }
}
