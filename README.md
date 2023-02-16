# Dependencies

`deno` and `java`

# Setup

## Install dependencies

### Debian

```bash
sudo apt install deno openjdk-19-jre
```

### Arch

```bash
sudo pacman -S deno jre-openjdk
```

## Configure

Copy `.env.example` to `.env` and edit it.

```bash
cp .env.example .env
```

## Setup systemd

Copy `services/*` to `/etc/systemd/system/` and edit if necessary.

```bash
sudo cp services/* /etc/systemd/system/
```

### Enable services

```bash
sudo systemctl enable --now mcstarter.service
sudo systemctl enable --now velocity.service
```
