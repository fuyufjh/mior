#[macro_use] extern crate rocket;

mod api;

#[launch]
fn rocket() -> _ {
    rocket::build().attach(api::stage())
}
