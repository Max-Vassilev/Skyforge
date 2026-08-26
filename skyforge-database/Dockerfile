# ============================================================================
# Drone Shop Backend :: Database image
# PostgreSQL 16 preloaded with schema (DDL) and seed data.
# Scripts in /docker-entrypoint-initdb.d/ run in lexical order on first init.
# ============================================================================
FROM postgres:16-alpine

# Default database / credentials (override in production).
ENV POSTGRES_DB=droneshop \
    POSTGRES_USER=droneshop \
    POSTGRES_PASSWORD=droneshop

# Numeric prefixes guarantee execution order: schema first, then seed data.
COPY db.sql   /docker-entrypoint-initdb.d/01_db.sql
COPY seed.sql /docker-entrypoint-initdb.d/02_seed.sql

EXPOSE 5432
