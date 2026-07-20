# Database design
SQLite is appropriate for the single-instance MVP and zero external dependency. The only table is `subscriptions`; no raw descriptions or medical history are persisted. A production migration can preserve the schema in Postgres, add migrations, backups, encryption, and indexes once volume exceeds roughly 10k rows.

