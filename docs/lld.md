# Low-level design
Pydantic models in `backend/main.py` define request/profile/trial/response contracts. Each registry adapter has an independent four-second timeout. Search returns `registries_responded`; empty adapters do not fail the request. Subscription writes JSON arrays to SQLite.

