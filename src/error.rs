use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Error, Debug)]
pub enum MalformedFeedError {
    #[error("parse error: {0}")]
    Parse(#[from] xmltree::ParseError),

    #[error("tag <{0}> not found")]
    TagNotFound(&'static str),

    #[error("invalid value in tag <{0}>")]
    InvalidTag(&'static str),
}

#[derive(Error, Debug)]
pub enum Error {
    #[error("malformed feed: {0}")]
    MalformedFeed(#[from] MalformedFeedError),

    #[error("fetch feed error: {0}")]
    FetchFeedRequest(#[from] reqwest::Error),

    #[error("fetch feed error: status: {0}")]
    FetchFeedStatus(reqwest::StatusCode),

    #[error("database error")]
    Database(#[from] sqlx::error::Error),

    #[error("unauthorized")]
    Unauthorized,

    #[error("{0}")]
    Custom(String),
}

use rocket::http::Status;
use rocket::{response, Request};

impl<'r, 'o: 'r> response::Responder<'r, 'o> for Error {
    fn respond_to(self, request: &'r Request<'_>) -> response::Result<'o> {
        use response::status::*;
        use response::*;
        match self {
            Error::MalformedFeed(_) | Error::FetchFeedRequest(_) | Error::FetchFeedStatus(_) => {
                Custom(Status::FailedDependency, self.to_string()).respond_to(request)
            }
            Error::Database(e) => Debug(e).respond_to(request),
            Error::Custom(e) => BadRequest(Some(e)).respond_to(request),
            Error::Unauthorized => Unauthorized(Some(self.to_string())).respond_to(request),
        }
    }
}
