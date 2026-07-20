# High-level design
React/Vite calls FastAPI. FastAPI separates deterministic registry adapters from reasoning boundaries, runs adapters with `asyncio.gather`, and uses SQLite only for notification subscriptions. Registry freshness is external and partial failure is explicit.

