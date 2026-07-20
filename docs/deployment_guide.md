# Deployment
Run `uvicorn main:app --reload` in `backend`; run `npm install && npm run dev` in `frontend`. Build the backend with the included Dockerfile. Supply secrets through `.env`, terminate TLS at the platform, and roll back to the previous image.

