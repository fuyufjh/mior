# mior

_Merge into one RSS_

## Development Guide

### Frontend

The frontend is built with [Next.js](https://nextjs.org/) and [MUI](https://mui.com/zh/), and uses [Yarn](https://yarnpkg.com/) as its package manager.
We recommend installing Node.js with [fnm](https://github.com/Schniz/fnm) (Fast Node Manager).

```bash
curl -fsSL https://fnm.vercel.app/install | bash
```

Install Node.js and Yarn package manager.

```bash
cd frontend/
fnm install
npm install -g yarn
```

Install dependencies and start dev server.

```bash
yarn install
yarn dev
```

To build into static HTMLs:

```bash
yarn build
```

### Backend

The backend server is developed with [Rust](https://www.rust-lang.org/) language and [Rocket](https://rocket.rs/) web framework.
If this is your first time to build Rust projects, please install [rustup](https://rustup.rs/) and it will
set up all the environment automatically.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Additionally, openssl library is required by Rocket. 

```bash
# On macOS
brew install openssl@1.1

# On Debian/Ubuntu
sudo apt-get -y install pkg-config libssl-dev
```

Compile and start up the server:

```bash
cargo run
```

To build into binary in release mode:

```bash
cargo build --release
```
