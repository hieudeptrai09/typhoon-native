-- The queries live here rather than in TypeScript because the app has no raw TCP sockets and
-- reaches the data over HTTP instead.
--
-- Two rules keep the TypeScript mappers unchanged:
--   * column aliases stay camelCase, matching the Row interfaces in lib/data/rows/
--   * every bigint is cast to text — as JSON numbers they would lose precision silently
--
-- Apply with: psql "$SUPABASE_POSTGRES_URL" -f db/functions.sql

SET search_path TO catfisha_typhoons, public;

-- ============================================================================================
-- Projections
-- ============================================================================================
-- Defined once so every function returning storms or names emits an identical shape.

CREATE OR REPLACE VIEW catfisha_typhoons.v_storms AS
SELECT
    s.position,
    p.country::text                                                     AS country,
    s.name::text                                                        AS name,
    s.intensity::text                                                   AS intensity,
    s.map::text                                                         AS map,
    s.correctspelling::text                                             AS "correctSpelling",
    s.year,
    s.isstrongest                                                       AS "isStrongest",
    s.startdate::text                                                   AS "dateStart",
    s.enddate::text                                                     AS "dateEnd",
    LPAD(s.jtwcnumber::text, 2, '0') || p.suffix::text                   AS "jtwcDesignation",
    s.isfirst                                                           AS "isFirst",
    s.islast                                                            AS "isLast",
    -- Appended rather than slotted next to "jtwcDesignation": CREATE OR REPLACE VIEW only ever
    -- adds columns at the end, and get_storms depends on this view so it cannot be dropped.
    s.jmanumber::text                                                   AS "jmaNumber"
FROM catfisha_typhoons.storms s
INNER JOIN catfisha_typhoons.positions p ON s.position = p.id;

CREATE OR REPLACE VIEW catfisha_typhoons.v_typhoon_names AS
SELECT
    tn.id::text                                                         AS id,
    tn.name::text                                                       AS name,
    tn.meaning::text                                                    AS meaning,
    tn.position,
    p.country::text                                                     AS country,
    tn.isretired                                                        AS "isRetired",
    tn.isreplaced                                                       AS "isReplaced",
    tn.retirementreason::text                                           AS "retirementReason",
    tn.replacementname::text                                            AS "replacementName",
    tn.note,
    tn.language::text                                                   AS language,
    tn.originaltext                                                     AS "originalText",
    tn.ipa,
    tn.pronunciationfile                                                AS "pronunciationFile",
    tn.lastyear                                                         AS "lastYear",
    tn.image::text                                                      AS image,
    tn.imageauthor::text                                                AS "imageAuthor",
    il.name::text                                                       AS "imageLicense",
    il.url::text                                                        AS "imageLicenseUrl",
    tn.imagesourceurl::text                                             AS "imageSourceUrl",
    tn.description::text                                                AS description,
    tn.tag::text                                                        AS tag
FROM catfisha_typhoons.typhoonnames tn
INNER JOIN catfisha_typhoons.positions p ON tn.position = p.id
LEFT JOIN catfisha_typhoons.imagelicenses il ON tn.imagelicenseid = il.id;

-- ============================================================================================
-- Storms
-- ============================================================================================

-- Dropped first because CREATE OR REPLACE cannot widen a function's RETURNS TABLE; the drop is
-- safe because nothing in the database depends on it, only the app's routes do.
DROP FUNCTION IF EXISTS public.get_storms(integer);

CREATE OR REPLACE FUNCTION public.get_storms(p_position integer DEFAULT NULL)
RETURNS TABLE (
    "position" integer,
    country text,
    name text,
    intensity text,
    map text,
    "correctSpelling" text,
    year integer,
    "isStrongest" boolean,
    "dateStart" text,
    "dateEnd" text,
    "jtwcDesignation" text,
    "jmaNumber" text,
    "isFirst" boolean,
    "isLast" boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT
        v.position, v.country, v.name, v.intensity, v.map, v."correctSpelling", v.year,
        v."isStrongest", v."dateStart", v."dateEnd", v."jtwcDesignation", v."jmaNumber",
        v."isFirst", v."isLast"
    FROM catfisha_typhoons.v_storms v
    WHERE p_position IS NULL OR v.position = p_position
    ORDER BY v.year ASC, v.position;
$$;

CREATE OR REPLACE FUNCTION public.get_storm_history()
RETURNS TABLE (name text, "position" integer, year integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT s.name::text, s.position, s.year
    FROM catfisha_typhoons.storms s
    ORDER BY s.year ASC;
$$;

-- Returns a json array: every ongoing storm, newest first, or the single next name in the
-- rotation when nothing is ongoing. The card shows one at a time and offers the rest, so the
-- caller must not cache it — a storm that starts has to reach the card.
CREATE OR REPLACE FUNCTION public.get_storm_highlight()
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
DECLARE
    v_active json;
    v_name text;
    v_position integer;
    v_next_position integer;
    v_next_name text;
BEGIN
    -- Ongoing storms outrank everything else.
    -- intensity/dateStart only exist on this branch: the "next" branch names a slot in the
    -- rotation, which has no storm behind it yet.
    SELECT json_agg(
               json_build_object(
                   'name', c.name,
                   'position', c.position,
                   'status', 'active',
                   'intensity', c.intensity,
                   'dateStart', c."dateStart"
               ) ORDER BY c."dateStart" DESC, c.id DESC
           )
    INTO v_active
    FROM (
        SELECT s.id, s.name::text AS name, s.position, s.intensity::text AS intensity,
               s.startdate::text AS "dateStart"
        FROM catfisha_typhoons.storms s
        WHERE s.enddate IS NULL
    ) c;

    IF v_active IS NOT NULL THEN
        RETURN v_active;
    END IF;

    -- Otherwise point at whatever name comes next after the most recent storm.
    SELECT s.name::text, s.position INTO v_name, v_position
    FROM catfisha_typhoons.storms s
    WHERE s.position BETWEEN 1 AND 140
    ORDER BY s.year DESC, s.startdate DESC, s.id DESC
    LIMIT 1;

    IF v_name IS NULL THEN
        RETURN NULL;
    END IF;

    v_next_position := (v_position % 140) + 1;

    SELECT tn.name::text INTO v_next_name
    FROM catfisha_typhoons.typhoonnames tn
    WHERE tn.position = v_next_position AND tn.isretired = false
    LIMIT 1;

    -- No name in rotation for that slot: fall back to the storm we just found.
    IF v_next_name IS NULL THEN
        RETURN json_build_array(
            json_build_object('name', v_name, 'position', v_position, 'status', 'next')
        );
    END IF;

    RETURN json_build_array(
        json_build_object('name', v_next_name, 'position', v_next_position, 'status', 'next')
    );
END;
$$;

-- ============================================================================================
-- Names
-- ============================================================================================

CREATE OR REPLACE FUNCTION public.get_name_list()
RETURNS TABLE (name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT tn.name::text FROM catfisha_typhoons.typhoonnames tn
    UNION
    SELECT DISTINCT s.name::text FROM catfisha_typhoons.storms s WHERE s.position IN (141, 142, 143)
    ORDER BY 1;
$$;

CREATE OR REPLACE FUNCTION public.get_typhoon_names()
RETURNS TABLE (
    id text,
    name text,
    meaning text,
    "position" integer,
    country text,
    "isRetired" boolean,
    "isReplaced" boolean,
    "retirementReason" text,
    "replacementName" text,
    note text,
    language text,
    "originalText" text,
    ipa text,
    "pronunciationFile" text,
    "lastYear" integer,
    image text,
    "imageAuthor" text,
    "imageLicense" text,
    "imageLicenseUrl" text,
    "imageSourceUrl" text,
    description text,
    tag text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT * FROM catfisha_typhoons.v_typhoon_names;
$$;

-- Two queries bundled into one payload, since each call is now an HTTP round trip. `name` is null
-- when nothing matched, which together with an empty storm list is the not-found state.
CREATE OR REPLACE FUNCTION public.get_typhoon_name_by_name(p_name text)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT json_build_object(
        'name', (
            SELECT to_json(n)
            FROM catfisha_typhoons.v_typhoon_names n
            WHERE LOWER(n.name) = LOWER(p_name)
            LIMIT 1
        ),
        'storms', COALESCE((
            SELECT json_agg(v ORDER BY v.year ASC, v.position)
            FROM catfisha_typhoons.v_storms v
            WHERE LOWER(v.name) = LOWER(p_name)
        ), '[]'::json)
    );
$$;

CREATE OR REPLACE FUNCTION public.get_suggested_names()
RETURNS TABLE (
    "nameId" text,
    "replacementName" text,
    "replacementMeaning" text,
    "isChosen" boolean,
    image text,
    "imageAuthor" text,
    "imageLicense" text,
    "imageLicenseUrl" text,
    "imageSourceUrl" text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT
        sn.nameid::text,
        sn.replacementname::text,
        sn.meaning::text,
        sn.ischosen,
        sn.image::text,
        sn.imageauthor::text,
        il.name::text,
        il.url::text,
        sn.imagesourceurl::text
    FROM catfisha_typhoons.suggestednames sn
    LEFT JOIN catfisha_typhoons.imagelicenses il ON sn.imagelicenseid = il.id
    ORDER BY sn.id ASC, sn.nameid DESC, sn.ischosen DESC;
$$;

-- ============================================================================================
-- Positions
-- ============================================================================================

-- Three queries bundled into one payload, since each call is now an HTTP round trip. Returns null
-- for an unknown position, which is the not-found state.
CREATE OR REPLACE FUNCTION public.get_position_details(p_position integer)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT json_build_object(
        'country', p.country::text,
        'names', COALESCE((
            SELECT json_agg(n ORDER BY n."lastYear" ASC, n.name ASC)
            FROM catfisha_typhoons.v_typhoon_names n
            WHERE n.position = p_position
        ), '[]'::json),
        'storms', COALESCE((
            SELECT json_agg(v ORDER BY v.year ASC)
            FROM catfisha_typhoons.v_storms v
            WHERE v.position = p_position
        ), '[]'::json)
    )
    FROM catfisha_typhoons.positions p
    WHERE p.id = p_position
    LIMIT 1;
$$;

-- ============================================================================================
-- Search
-- ============================================================================================

-- The second arm exists to catch storms whose name was never in rotation, so has no name row.
CREATE OR REPLACE FUNCTION public.search_names(p_query text)
RETURNS TABLE (
    id text,
    name text,
    "position" integer,
    country text,
    "isRetired" boolean,
    "retirementReason" text,
    note text,
    "replacementName" text,
    "stormCount" text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT
        tn.id::text,
        tn.name::text,
        tn.position,
        p.country::text,
        tn.isretired,
        tn.retirementreason::text,
        tn.note,
        tn.replacementname::text,
        COUNT(s.id)::text
    FROM catfisha_typhoons.typhoonnames tn
    INNER JOIN catfisha_typhoons.positions p ON tn.position = p.id
    LEFT JOIN catfisha_typhoons.storms s ON s.name = tn.name
    WHERE tn.name ILIKE '%' || p_query || '%'
    GROUP BY tn.id, tn.name, tn.position, p.country, tn.isretired, tn.retirementreason, tn.note,
             tn.replacementname

    UNION

    SELECT
        NULL,
        s.name::text,
        s.position,
        p.country::text,
        false,
        -- Storms with no matching name row were never in rotation, so they have no reason.
        NULL,
        NULL,
        NULL,
        COUNT(s.id)::text
    FROM catfisha_typhoons.storms s
    INNER JOIN catfisha_typhoons.positions p ON s.position = p.id
    WHERE s.name ILIKE '%' || p_query || '%'
      AND s.name NOT IN (SELECT tn2.name FROM catfisha_typhoons.typhoonnames tn2)
    GROUP BY s.name, s.position, p.country

    ORDER BY 2 ASC;
$$;

-- ============================================================================================
-- On this day
-- ============================================================================================

-- The started/ended/both reason is derived client-side from the two dates, not returned here.
CREATE OR REPLACE FUNCTION public.get_on_this_day(p_day integer, p_month integer)
RETURNS TABLE (
    name text,
    intensity text,
    "position" integer,
    year integer,
    "dateStart" text,
    "dateEnd" text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT
        s.name::text,
        s.intensity::text,
        s.position,
        s.year,
        s.startdate::text,
        s.enddate::text
    FROM catfisha_typhoons.storms s
    WHERE (EXTRACT(MONTH FROM s.startdate) = p_month AND EXTRACT(DAY FROM s.startdate) = p_day)
       OR (EXTRACT(MONTH FROM s.enddate) = p_month AND EXTRACT(DAY FROM s.enddate) = p_day)
    ORDER BY s.year ASC;
$$;

-- The CASE handles storms that span New Year, where the MMDD range wraps instead of nesting.
CREATE OR REPLACE FUNCTION public.get_active_on_this_day(p_day integer, p_month integer)
RETURNS TABLE (
    name text,
    intensity text,
    "position" integer,
    year integer,
    "dateStart" text,
    "dateEnd" text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT
        s.name::text,
        s.intensity::text,
        s.position,
        s.year,
        s.startdate::text,
        s.enddate::text
    FROM catfisha_typhoons.storms s
    WHERE (s.enddate IS NULL AND s.startdate <= CURRENT_DATE)
       OR (s.enddate IS NOT NULL
           AND CASE WHEN EXTRACT(YEAR FROM s.enddate) = EXTRACT(YEAR FROM s.startdate)
               THEN to_char(s.startdate, 'MMDD')::int <= p_month * 100 + p_day
                AND to_char(s.enddate, 'MMDD')::int >= p_month * 100 + p_day
               ELSE to_char(s.startdate, 'MMDD')::int <= p_month * 100 + p_day
                 OR to_char(s.enddate, 'MMDD')::int >= p_month * 100 + p_day
           END)
    ORDER BY s.year ASC;
$$;

-- ============================================================================================
-- Facts
-- ============================================================================================

-- The fact list costs 51 queries to assemble and changes only when the data does, so
-- scripts/generate-facts.ts builds it out of band and stores it here.
CREATE TABLE IF NOT EXISTS catfisha_typhoons.facts (
    id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    text text NOT NULL,
    generatedat timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.get_random_fact()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = catfisha_typhoons, public
AS $$
    SELECT f.text FROM catfisha_typhoons.facts f ORDER BY random() LIMIT 1;
$$;

-- ============================================================================================
-- Grants
-- ============================================================================================
-- Postgres grants EXECUTE to PUBLIC by default, so each one is revoked first and then handed back
-- to the two API roles explicitly.

DO $$
DECLARE
    fn text;
BEGIN
    FOREACH fn IN ARRAY ARRAY[
        'public.get_storms(integer)',
        'public.get_storm_history()',
        'public.get_storm_highlight()',
        'public.get_name_list()',
        'public.get_typhoon_names()',
        'public.get_typhoon_name_by_name(text)',
        'public.get_suggested_names()',
        'public.get_position_details(integer)',
        'public.search_names(text)',
        'public.get_on_this_day(integer, integer)',
        'public.get_active_on_this_day(integer, integer)',
        'public.get_random_fact()'
    ]
    LOOP
        EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
        EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated', fn);
    END LOOP;
END;
$$;
