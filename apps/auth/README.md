# Setup Keycloak local

## Step 1: Install Docker

### Add Docker's official GPG key:

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
```

### Add the repository to Apt sources:

```bash
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

### Install latest version

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## Step 2: Start Container

```bash
cd compose/folder/path
docker compose up -d
```

## Step 3: Configure Keycloak

- Add realm "edulution"
- Add client "edulution-ui"
  -- Web origins: http://localhost:5173
  -- Checkbox Direct access grants -> true
- Add user or connect to ldap
