# Open Notebook Setup Workflow

This document illustrates the setup workflows available for Open Notebook, especially for Ollama users.

## 🎯 One-Command Setup (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  User runs: ./run.sh                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Check Docker    │
              │ installed?      │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │No ✗
                   │      │
                   │      └──► Show install instructions
                   │             and exit
                   ▼
              ┌─────────────────┐
              │ Check Docker    │
              │ daemon running? │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │No ✗
                   │      │
                   │      └──► Try to start daemon
                   │             (systemctl/service/open)
                   ▼
              ┌─────────────────┐
              │ Config files    │
              │ exist?          │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │No ✗
                   │      │
                   │      └──► Run ./setup.sh
                   │             automatically
                   ▼
              ┌─────────────────┐
              │ Container       │
              │ exists?         │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │No ✗
                   │      │
                   │      └──► Pull image
                   │           Create directories
                   │           Run container
                   │      
                   ▼
              ┌─────────────────┐
              │ Is it running?  │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │No ✗
                   │      │
                   │      └──► Start existing
                   │             container
                   ▼
         ┌──────────────────────┐
         │ ✅ SUCCESS!          │
         │ Show access URL      │
         │ Show helpful commands│
         └──────────────────────┘
```

**Total commands:** `1` (just `./run.sh`)

---

## 🔧 Two-Step Setup (With Configuration)

```
┌─────────────────────────────────────────────────────────────┐
│  Step 1: User runs ./setup.sh                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Check tools     │
              │ (curl, docker)  │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │Missing
                   │      │
                   │      └──► Offer to install
                   │             (with apt/yum/brew)
                   ▼
              ┌─────────────────┐
              │ Ask: Where is   │
              │ Ollama running? │
              └─────┬───────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
    Localhost  Docker/Host  Remote IP   Skip
        │           │           │           │
        └───────────┴───────────┴───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ Create .env     │
              │ with Ollama URL │
              └─────┬───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ Test Ollama     │
              │ connection      │
              └────┬──────┬─────┘
                   │      │
            ✓ OK   │      │Failed ✗
                   │      │
                   │      └──► Show troubleshooting
                   │             tips
                   ▼
              ┌─────────────────┐
              │ Offer to pull   │
              │ models?         │
              └────┬──────┬─────┘
                   │      │
             ✓ Yes│      │No
                   │      │
                   │      └──► Skip model pull
                   ▼
         ┌──────────────────────┐
         │ Pull qwen3 and       │
         │ mxbai-embed-large    │
         └─────┬────────────────┘
               │
               ▼
         ┌──────────────────────┐
         │ ✅ Configuration     │
         │ complete!            │
         │ Show next steps      │
         └──────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Step 2: User runs ./run.sh                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Read config     │
              │ from .env       │
              └─────┬───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ Pull image      │
              │ Start container │
              └─────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ ✅ Running!          │
         │ Access at :8502      │
         └──────────────────────┘
```

**Total commands:** `2` (`./setup.sh` then `./run.sh`)

---

## 📦 Docker Compose Setup

```
┌─────────────────────────────────────────────────────────────┐
│  User runs: docker compose -f docker-compose.ollama.yml up │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Read compose    │
              │ file            │
              └─────┬───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ Pull image      │
              └─────┬───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ Create volumes  │
              │ - notebook_data │
              │ - surreal_data  │
              └─────┬───────────┘
                    │
                    ▼
              ┌─────────────────┐
              │ Start container │
              │ with env vars   │
              │ from compose    │
              └─────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ ✅ Running!          │
         │ Access at :8502      │
         └──────────────────────┘
```

**Pre-requisite:** Ollama must be running on host with `OLLAMA_HOST=0.0.0.0:11434`

---

## 🔄 What Happens After Setup

```
         ┌──────────────────────┐
         │ Container Running    │
         └─────┬────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌──────────┐      ┌──────────┐
│SurrealDB │      │   API    │
│ :8000    │◄─────┤  :5055   │
│(internal)│      │          │
└──────────┘      └─────┬────┘
                        │
                        ▲
                        │
                  ┌─────┴────┐
                  │ Frontend │
                  │  :8502   │
                  └─────┬────┘
                        │
                        ▼
                  ┌──────────┐
                  │ Browser  │
                  │  User    │
                  └─────┬────┘
                        │
                  Access URLs:
                  • http://localhost:8502 (UI)
                  • http://localhost:5055/docs (API)
```

**External Connection:**
```
Container :5055 API ──► host.docker.internal:11434 ──► Ollama on Host
                                                        ▼
                                                   qwen3, mxbai-embed-large
```

---

## 🛠️ Troubleshooting Flowchart

```
┌─────────────────────────────────────────────────────────────┐
│  Problem: "Ollama unavailable" in Open Notebook             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Is Ollama       │
              │ installed?      │
              └────┬──────┬─────┘
                   │      │
              No ✗ │      │✓ Yes
                   │      │
                   │      └──► ┌─────────────────┐
                   │           │ Is Ollama       │
                   │           │ running?        │
                   │           └────┬──────┬─────┘
                   │                │      │
                   │           No ✗ │      │✓ Yes
                   │                │      │
                   │                │      └──► ┌─────────────────┐
                   │                │           │ Is OLLAMA_HOST  │
                   │                │           │ = 0.0.0.0:11434?│
                   │                │           └────┬──────┬─────┘
                   │                │                │      │
                   │                │           No ✗ │      │✓ Yes
                   │                │                │      │
                   │                │                │      └──► ┌─────────────────┐
                   │                │                │           │ Is OLLAMA_API_  │
                   │                │                │           │ BASE correct in │
                   │                │                │           │ .env?           │
                   │                │                │           └────┬──────┬─────┘
                   │                │                │                │      │
                   │                │                │           No ✗ │      │✓ Yes
                   ▼                ▼                ▼                ▼      │
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
         │Install Ollama│  │Start Ollama  │  │Restart with  │  │Fix .env ││
         │curl install  │  │ollama serve  │  │OLLAMA_HOST=  │  │file     ││
         │script        │  │              │  │0.0.0.0:11434 │  │         ││
         └──────────────┘  └──────────────┘  └──────────────┘  └─────────┘│
                                                                            │
                                                                            ▼
                                                                   ┌──────────────┐
                                                                   │Try different │
                                                                   │model or check│
                                                                   │model is      │
                                                                   │pulled        │
                                                                   └──────────────┘
```

---

## 📝 Summary Table

| Method | Commands | Configuration | Difficulty | Best For |
|--------|----------|---------------|------------|----------|
| **run.sh** | 1 | Automatic | ⭐ Easy | First-time users |
| **setup.sh + run.sh** | 2 | Interactive | ⭐⭐ Easy | Custom setups |
| **Docker Compose** | 1 | Manual edit | ⭐⭐ Easy | Docker users |
| **Manual Docker** | 1-3 | Manual | ⭐⭐⭐ Medium | Advanced users |

---

## 🎓 Learning Resources

After setup, check these resources:
- **OLLAMA_QUICKSTART.md** - Detailed Ollama guide
- **docs/features/ollama.md** - Comprehensive Ollama documentation
- **docs/user-guide/** - How to use Open Notebook
- **docs/troubleshooting/** - Common issues and solutions

## 💡 Pro Tips

1. **Always start Ollama with `OLLAMA_HOST=0.0.0.0:11434`** when using Docker
2. **Pull both language and embedding models** for full functionality
3. **Use `./run.sh` for the simplest experience** - it handles everything
4. **Check container logs** with `docker logs -f open-notebook` if issues arise
5. **Run `./setup.sh` again** anytime to reconfigure Ollama settings
