# Dependencies

`deno` and `java`

# Setup

## Install dependencies

### Debian

```bash
sudo apt install openjdk-19-jre unzip
curl -fsSL https://deno.land/x/install/install.sh | sh
echo 'export DENO_INSTALL="'$HOME'/.deno"' >> .bashrc
echo 'export PATH="$DENO_INSTALL/bin:$PATH"' >> .bashrc
source .bashrc
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
