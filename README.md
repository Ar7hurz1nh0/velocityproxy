# Dependencies

`bun@^1.1.9`, `java` and `ssh`

# Setup

## Install dependencies

### Debian

```bash
sudo apt install openjdk-21-jre unzip
curl -fsSL https://bun.sh/install | bash
source .bashrc # Or your shell equivalent
```

### Arch

```bash
curl -fsSL https://bun.sh/install | bash
sudo pacman -S jre-openjdk
```

## Configure

Install dependencies

```bash
bun install
```

Edit `config.ts` to suit your needs

Generate a random string for `forwarding.secret`. (if you're using `player-info-forwarding=modern`)

```bash
openssl rand -base64 -out "forwarding.secret" 32
```

Also you probably want to append this to `~/.ssh/config` (if you're using ssh tunnels)

```bash
Host *
  ServerAliveInterval 20
  TCPKeepAlive no
```

## Setup systemd

Copy `services/*` to `/etc/systemd/system/` and edit if necessary.

```bash
sudo cp services/* /etc/systemd/system/
```

### Enable services

```bash
sudo systemctl enable --now velocity.service
```
