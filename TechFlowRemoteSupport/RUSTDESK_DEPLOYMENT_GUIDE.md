# TechFlow RustDesk Server — Final Deployment Guide

**Open-Source Self-Hosted Remote Support Solution**

This guide documents the exact deployment of TechFlow Solutions' production RustDesk server running on Oracle Cloud Infrastructure.

---

## What You Have Running

- **hbbs** (broker) - Handles ID lookup and P2P negotiation
- **hbbr** (relay) - Handles fallback when P2P is blocked
- **Full UAC elevation** - Complete administrative access
- **P2P + relay fallback** - Automatic connection optimization
- **No accounts required** - Simple, trust-based workflow
- **Fully self-hosted** - Complete control and privacy
- **Zero cost** - Free Oracle Cloud tier

---

## Server Information

**Platform:** Oracle Cloud Infrastructure (Free Tier)
**Operating System:** Ubuntu 22.04 LTS
**Public IP:** Your Oracle instance public IP
**Ports Used:** 21115-21119

---

## Initial Server Setup

### 1. Update the Server
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable docker --now
```

### 3. Pull RustDesk Image
```bash
sudo docker pull rustdesk/rustdesk-server
```
This is the only image needed for the free, open-source version.

### 4. Create RustDesk Data Directory
```bash
sudo mkdir -p /var/lib/rustdesk
sudo chmod 755 /var/lib/rustdesk
```
This directory stores:
- Encryption keys
- Server configuration
- Persistent data

---

## Deploy RustDesk Services

### 5. Start hbbs (Broker Service)
```bash
sudo docker run -d --restart unless-stopped --name hbbs \
  -p 21115:21115 \
  -p 21116:21116 \
  -p 21116:21116/udp \
  -p 21118:21118 \
  -v /var/lib/rustdesk:/root \
  rustdesk/rustdesk-server hbbs \
  -r YOUR_PUBLIC_IP:21117
```

**Replace `YOUR_PUBLIC_IP` with your Oracle instance public IP.**

Example:
```bash
-r 40.233.65.143:21117
```

### 6. Start hbbr (Relay Service)
```bash
sudo docker run -d --restart unless-stopped --name hbbr \
  -p 21117:21117 \
  -p 21117:21117/udp \
  -p 21119:21119 \
  -v /var/lib/rustdesk:/root \
  rustdesk/rustdesk-server hbbr
```

**📌 Important: Automatic Restart Policy**

The `--restart unless-stopped` flag ensures:
- ✅ Containers automatically start after server reboot
- ✅ Containers restart if they crash
- ✅ RustDesk server stays online 24/7
- ✅ No manual intervention needed after maintenance

To verify containers will auto-start after reboot:
```bash
sudo docker inspect hbbs hbbr | grep -A 3 "RestartPolicy"
```

You should see `"Name": "unless-stopped"` for both containers.

### 7. Verify Services Are Running
```bash
sudo docker ps
```

You should see:
```
CONTAINER ID   IMAGE                        STATUS
xxxxxxxxxx     rustdesk/rustdesk-server     Up X minutes   hbbs
xxxxxxxxxx     rustdesk/rustdesk-server     Up X minutes   hbbr
```

---

## Firewall Configuration

### Oracle Cloud Security List Rules
Configure these in your Oracle Cloud Console:

| Port | Protocol | Source | Description |
|------|----------|--------|-------------|
| 21115 | TCP | 0.0.0.0/0 | RustDesk hbbs |
| 21116 | TCP | 0.0.0.0/0 | RustDesk hbbs |
| 21116 | UDP | 0.0.0.0/0 | RustDesk hbbs |
| 21117 | TCP | 0.0.0.0/0 | RustDesk hbbr |
| 21117 | UDP | 0.0.0.0/0 | RustDesk hbbr |
| 21118 | TCP | 0.0.0.0/0 | RustDesk hbbs |
| 21119 | TCP | 0.0.0.0/0 | RustDesk hbbr |

### Ubuntu UFW Firewall (if enabled)
```bash
sudo ufw allow 21115/tcp
sudo ufw allow 21116/tcp
sudo ufw allow 21116/udp
sudo ufw allow 21117/tcp
sudo ufw allow 21117/udp
sudo ufw allow 21118/tcp
sudo ufw allow 21119/tcp
```

---

## Client Configuration

### On Each Client Machine:

1. **Download RustDesk**
   - Visit: https://rustdesk.com/
   - Download Windows installer
   - Install normally

2. **Configure Server Settings**
   - Open RustDesk
   - Click **Settings** (gear icon)
   - Go to **Network** tab
   - Enter:
     ```
     ID Server: YOUR_PUBLIC_IP
     Relay Server: YOUR_PUBLIC_IP
     API Server: (leave blank)
     ```
   - Click **OK**
   - Restart RustDesk

3. **Ready to Connect**
   - Client's RustDesk ID will be displayed
   - Share ID and password with technician
   - Technician connects remotely

---

## Connection Workflow

### For Clients:
1. Open RustDesk
2. Read their **9-digit ID** to technician
3. Read their **6-character password** to technician
4. Approve connection when prompted
5. Approve UAC elevation when needed

### For Technicians:
1. Open RustDesk
2. Enter client's **ID**
3. Enter client's **password**
4. Click **Connect**
5. Full administrative access granted
6. UAC elevation works automatically

---

## Server Management

### View Container Logs
```bash
# hbbs logs
sudo docker logs hbbs

# hbbr logs
sudo docker logs hbbr

# Follow logs in real-time
sudo docker logs -f hbbs
```

### Restart Services
```bash
# Restart hbbs
sudo docker restart hbbs

# Restart hbbr
sudo docker restart hbbr

# Restart both
sudo docker restart hbbs hbbr
```

### Stop Services
```bash
sudo docker stop hbbs hbbr
```

### Start Services
```bash
sudo docker start hbbs hbbr
```

---

## Updating RustDesk Server

### Complete Update Process:
```bash
# 1. Stop containers
sudo docker stop hbbs hbbr

# 2. Remove containers
sudo docker rm hbbs hbbr

# 3. Pull latest image
sudo docker pull rustdesk/rustdesk-server

# 4. Start hbbs (use your actual public IP)
sudo docker run -d --restart unless-stopped --name hbbs \
  -p 21115:21115 \
  -p 21116:21116 \
  -p 21116:21116/udp \
  -p 21118:21118 \
  -v /var/lib/rustdesk:/root \
  rustdesk/rustdesk-server hbbs \
  -r YOUR_PUBLIC_IP:21117

# 5. Start hbbr
sudo docker run -d --restart unless-stopped --name hbbr \
  -p 21117:21117 \
  -p 21117:21117/udp \
  -p 21119:21119 \
  -v /var/lib/rustdesk:/root \
  rustdesk/rustdesk-server hbbr

# 6. Verify
sudo docker ps
```

**Your data persists in `/var/lib/rustdesk` — it's never deleted during updates.**

---

## Troubleshooting

### Port 21119 Already in Use
**Symptom:** Error: "port is already allocated"

**Solution:**
```bash
# Find process using port
sudo lsof -i :21119

# Kill the process
sudo kill <PID>

# Restart hbbr
sudo docker restart hbbr
```

### Container Won't Start
**Solution:**
```bash
# Remove old containers
sudo docker rm hbbs hbbr

# Remove old images (optional)
sudo docker rmi rustdesk/rustdesk-server

# Pull fresh image
sudo docker pull rustdesk/rustdesk-server

# Start containers again
```

### Client Can't Connect
**Check:**
1. Verify server is running: `sudo docker ps`
2. Verify firewall rules are configured
3. Verify client has correct server IP
4. Restart client's RustDesk application

### UAC Elevation Not Working
**Solution:**
1. Ensure RustDesk is running with admin privileges on client
2. Client must approve UAC prompts when they appear
3. Verify server relay is running: `sudo docker ps | grep hbbr`

---

## Key Features

### ✅ What Works
- **Full UAC Elevation** - Complete administrative access
- **P2P Connections** - Direct peer-to-peer when possible
- **Relay Fallback** - Automatic relay when P2P blocked
- **File Transfer** - Send/receive files during sessions
- **Clipboard Sync** - Copy/paste between machines
- **Multi-Monitor** - Support for multiple displays
- **Chat** - Built-in text chat during sessions
- **Cross-Platform** - Windows, Mac, Linux support

### ❌ Open-Source Limitations
- **No Account System** - Can't create user accounts
- **No Web Console** - No browser-based management
- **No Access Logs** - No detailed session logging
- **Manual Client Setup** - Each client configures manually

---

## Production Deployment Checklist

- [x] Oracle Cloud instance created
- [x] Docker installed and running
- [x] RustDesk containers deployed
- [x] Firewall rules configured
- [x] Services verified running
- [x] Client configuration tested
- [x] UAC elevation verified
- [x] File transfer tested
- [x] Documentation created

---

## Support & Resources

**Official RustDesk:**
- Website: https://rustdesk.com/
- GitHub: https://github.com/rustdesk/rustdesk
- Documentation: https://rustdesk.com/docs/

**TechFlow Solutions:**
- For client support: (647) 572-8321
- Email: rob@techflowsolutions.ca

---

## Backup & Disaster Recovery

### Backup Important Data
```bash
# Backup encryption keys and config
sudo tar -czf rustdesk-backup-$(date +%Y%m%d).tar.gz /var/lib/rustdesk/

# Copy to safe location
scp rustdesk-backup-*.tar.gz user@backup-server:/backups/
```

### Restore from Backup
```bash
# Extract backup
sudo tar -xzf rustdesk-backup-YYYYMMDD.tar.gz -C /

# Restart containers
sudo docker restart hbbs hbbr
```

---

## Final Notes

This is your **production-ready, fully documented RustDesk deployment**.

**You have:**
- Zero-cost remote support infrastructure
- Full administrative access capabilities
- Complete control over your data
- Professional remote support tools
- Scalable solution for business growth

**Next Steps:**
1. Add server monitoring (optional)
2. Set up automated backups (recommended)
3. Create client onboarding materials
4. Train staff on connection procedures

---

**Deployment Date:** February 2026
**Deployed By:** TechFlow Solutions
**Status:** Production Active