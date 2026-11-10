-- Schéma initial MedPlant (PostgreSQL)

CREATE TABLE app_user (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER'
                  CHECK (role IN ('USER', 'AUTHOR', 'ADMIN')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE plant (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    common_name       VARCHAR(150) NOT NULL,
    scientific_name   VARCHAR(200) NOT NULL UNIQUE,
    plant_family      VARCHAR(150),
    description       TEXT,
    contraindications TEXT,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE article (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title          VARCHAR(255) NOT NULL,
    slug           VARCHAR(255) NOT NULL UNIQUE,
    category       VARCHAR(50)  NOT NULL
                   CHECK (category IN ('FICHE_PLANTE', 'DECRYPTAGE', 'GESTES_SAVOIRS', 'AUTRE')),
    evidence_level VARCHAR(50)  NOT NULL
                   CHECK (evidence_level IN ('TRADITIONNEL', 'ETUDE_PRELIMINAIRE', 'ESSAI_CLINIQUE', 'CONSENSUS', 'NON_PRECISE')),
    content        TEXT         NOT NULL,
    status         VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                   CHECK (status IN ('DRAFT', 'PUBLISHED')),
    author_id      BIGINT       NOT NULL REFERENCES app_user (id),
    plant_id       BIGINT       REFERENCES plant (id) ON DELETE SET NULL,
    published_at   TIMESTAMPTZ,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_article_status_published_at ON article (status, published_at DESC);
CREATE INDEX idx_article_author_id ON article (author_id);
CREATE INDEX idx_article_plant_id ON article (plant_id);

CREATE TABLE source (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title      VARCHAR(500) NOT NULL,
    url        VARCHAR(2048),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE article_source (
    article_id BIGINT NOT NULL REFERENCES article (id) ON DELETE CASCADE,
    source_id  BIGINT NOT NULL REFERENCES source (id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, source_id)
);

CREATE INDEX idx_article_source_source_id ON article_source (source_id);