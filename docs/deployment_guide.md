# Deployment
Run `uvicorn main:app --reload` in `backend`; run `npm install && npm run dev` in `frontend`. Build the backend with the included Dockerfile. Supply secrets through `.env`, terminate TLS at the platform, and roll back to the previous image.

Render uses `render.yaml` and exposes `DATABASE_URL`, `GROQ_API_KEY`, `GROQ_MODEL`, and AI rate-limit settings. Vercel should define `NEXT_PUBLIC_API_URL` as the public Render URL. AI-backed requests are limited per user/IP; ordinary health and subscription operations are not application-rate-limited.
