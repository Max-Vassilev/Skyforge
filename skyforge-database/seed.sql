-- ============================================================================
-- Drone Shop Backend :: SEED DATA
-- Target: PostgreSQL 16
-- Idempotent: uses ON CONFLICT DO NOTHING against unique columns so re-running
-- this file will not create duplicate brands, categories, or products.
-- brand_id / category_id are resolved via subqueries on slug/name for
-- robustness against changing serial ids.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Brands
-- ----------------------------------------------------------------------------
INSERT INTO brands (name, slug) VALUES
    ('DJI',         'dji'),
    ('Autel',       'autel'),
    ('Skydio',      'skydio'),
    ('Parrot',      'parrot'),
    ('Holy Stone',  'holy-stone'),
    ('FPV Freedom', 'fpv-freedom')
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
INSERT INTO categories (name, slug) VALUES
    ('Drones',          'drones'),
    ('Batteries',       'batteries'),
    ('Chargers',        'chargers'),
    ('Propellers/Fins', 'propellers-fins'),
    ('Controllers',     'controllers')
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Products
-- Each row resolves brand_id / category_id from slugs, and uses a unique
-- picsum seed for its image. ON CONFLICT (name, brand_id) DO NOTHING guards
-- against duplicate inserts on re-run.
-- ----------------------------------------------------------------------------
INSERT INTO products (name, description, price, image_url, stock, brand_id, category_id)
SELECT v.name, v.description, v.price, v.image_url, v.stock, b.id, c.id
FROM (
    VALUES
    -- ===================== DRONES =====================
    ('DJI Mavic 3 Pro', 'Flagship folding drone with triple-camera Hasselblad system, 43-min flight time, and omnidirectional obstacle sensing.', 2199.00, '/images/drones/dji-mavic-3-pro.jpg', 25, 'dji', 'drones'),
    ('DJI Air 3S', 'Dual-camera all-rounder with medium tele lens, 45-min flight time, and forward LiDAR obstacle avoidance.', 1099.00, '/images/drones/dji-air-3s.jpg', 40, 'dji', 'drones'),
    ('DJI Mini 4 Pro', 'Sub-249g compact drone with 4K/60fps HDR, omnidirectional sensing, and ActiveTrack 360.', 759.00, '/images/drones/dji-mini-4-pro.jpg', 60, 'dji', 'drones'),
    ('DJI Avata 2', 'Immersive FPV drone with built-in propeller guards, 4K stabilized video, and intuitive motion control.', 999.00, '/images/drones/dji-avata-2.jpg', 30, 'dji', 'drones'),
    ('Autel EVO Lite+', '1-inch CMOS sensor drone with 6K video, 40-min flight time, and adjustable aperture.', 1249.00, '/images/drones/autel-evo-lite-plus.jpg', 22, 'autel', 'drones'),
    ('Autel EVO II Pro V3', 'Professional 6K drone with 1-inch sensor, 360-degree obstacle avoidance, and 40-min endurance.', 1799.00, '/images/drones/autel-evo-ii-pro-v3.jpg', 15, 'autel', 'drones'),
    ('Autel Nano+', 'Ultralight sub-250g drone with 1/1.28-inch sensor, 50MP photos, and three-way obstacle avoidance.', 649.00, '/images/drones/autel-nano-plus.jpg', 35, 'autel', 'drones'),
    ('Skydio 2+', 'Autonomous AI tracking drone with 360-degree obstacle avoidance and cinematic follow modes.', 1099.00, '/images/drones/skydio-2-plus.jpg', 18, 'skydio', 'drones'),
    ('Skydio X10', 'Enterprise-grade autonomous drone with thermal imaging and rugged all-weather design.', 4499.00, '/images/drones/skydio-x10.jpg', 8, 'skydio', 'drones'),
    ('Parrot Anafi Ai', '4G-connected 48MP drone with 4K HDR video and full 180-degree tilt camera.', 999.00, '/images/drones/parrot-anafi-ai.jpg', 20, 'parrot', 'drones'),
    ('Parrot Anafi USA', 'Thermal + 32x zoom drone built for inspection and public safety missions.', 2499.00, '/images/drones/parrot-anafi-usa.jpg', 10, 'parrot', 'drones'),
    ('Holy Stone HS720G', 'GPS beginner drone with 4K EIS camera, brushless motors, and 26-min flight time.', 279.99, '/images/drones/holy-stone-hs720g.jpg', 80, 'holy-stone', 'drones'),
    ('Holy Stone HS175D', 'Foldable travel drone with GPS return-to-home and 4K camera for hobbyists.', 189.99, '/images/drones/holy-stone-hs175d.jpg', 100, 'holy-stone', 'drones'),
    ('FPV Freedom Falcon 5', 'Ready-to-fly 5-inch freestyle FPV quad with analog VTX and durable carbon frame.', 349.00, '/images/drones/fpv-freedom-falcon-5.jpg', 45, 'fpv-freedom', 'drones'),
    ('FPV Freedom Cinewhoop 3', 'Ducted 3-inch cinewhoop for smooth indoor cinematic FPV with GoPro mount.', 289.00, '/images/drones/fpv-freedom-cinewhoop-3.jpg', 38, 'fpv-freedom', 'drones'),

    -- ===================== BATTERIES =====================
    ('DJI Mavic 3 Intelligent Flight Battery', '5000mAh LiPo battery delivering up to 43 minutes of flight for the Mavic 3 series.', 219.00, '/images/batteries/dji-mavic-3-battery.jpg', 120, 'dji', 'batteries'),
    ('DJI Mini 4 Pro Intelligent Battery', 'Lightweight 2590mAh battery providing up to 34 minutes of flight time.', 89.00, '/images/batteries/dji-mini-4-pro-battery.jpg', 150, 'dji', 'batteries'),
    ('Autel EVO Lite Battery', '6175mAh intelligent battery offering up to 40 minutes of flight for EVO Lite series.', 129.00, '/images/batteries/autel-evo-lite-battery.jpg', 90, 'autel', 'batteries'),
    ('Autel Nano Series Battery', '2250mAh battery pack delivering up to 28 minutes for the Nano and Nano+.', 79.00, '/images/batteries/autel-nano-battery.jpg', 110, 'autel', 'batteries'),
    ('Skydio 2+ Battery', 'Replacement intelligent flight battery for up to 27 minutes of autonomous flight.', 149.00, '/images/batteries/skydio-2-battery.jpg', 60, 'skydio', 'batteries'),
    ('Parrot Anafi Battery', 'Slim smart battery delivering up to 25 minutes of flight for the Anafi series.', 99.00, '/images/batteries/parrot-anafi-battery.jpg', 75, 'parrot', 'batteries'),
    ('Holy Stone HS720G Battery', '2800mAh modular battery providing up to 26 minutes of flight time.', 39.99, '/images/batteries/holy-stone-hs720g-battery.jpg', 200, 'holy-stone', 'batteries'),
    ('FPV Freedom 6S 1300mAh LiPo', 'High-discharge 6S 1300mAh 120C LiPo pack tuned for 5-inch freestyle FPV.', 32.99, '/images/batteries/fpv-freedom-6s-1300.jpg', 250, 'fpv-freedom', 'batteries'),

    -- ===================== CHARGERS =====================
    ('DJI 100W USB-C Charger', 'Fast 100W GaN charger for rapidly topping up DJI drones, batteries, and hubs.', 79.00, '/images/chargers/dji-100w-charger.jpg', 130, 'dji', 'chargers'),
    ('DJI Mavic 3 Charging Hub', 'Charges up to three Mavic 3 batteries sequentially in a compact travel hub.', 65.00, '/images/chargers/dji-mavic-3-charging-hub.jpg', 85, 'dji', 'chargers'),
    ('Autel Multi-Charger Hub', 'Parallel charging hub for EVO Lite batteries with intelligent balancing.', 89.00, '/images/chargers/autel-multi-charger-hub.jpg', 55, 'autel', 'chargers'),
    ('Skydio Dual Charger', 'Dual-bay charger to keep two Skydio flight batteries ready to fly.', 99.00, '/images/chargers/skydio-dual-charger.jpg', 40, 'skydio', 'chargers'),
    ('Parrot USB Fast Charger', 'Compact USB fast charger for the Anafi battery and Skycontroller.', 45.00, '/images/chargers/parrot-usb-fast-charger.jpg', 70, 'parrot', 'chargers'),
    ('Holy Stone 3-in-1 Charging Cable', 'Multi-battery charging cable for simultaneously topping up three HS batteries.', 19.99, '/images/chargers/holy-stone-3in1-charger.jpg', 180, 'holy-stone', 'chargers'),
    ('FPV Freedom ISDT Q6 Pro LiPo Charger', 'Smart 300W 14A balance charger for 1S-6S LiPo packs with color display.', 59.99, '/images/chargers/fpv-freedom-isdt-q6-pro.jpg', 95, 'fpv-freedom', 'chargers'),

    -- ===================== PROPELLERS / FINS =====================
    ('DJI Mavic 3 Low-Noise Propellers (Pair)', 'Genuine low-noise quick-release propellers for the Mavic 3 series.', 15.00, '/images/propellers/dji-mavic-3-props.jpg', 300, 'dji', 'propellers-fins'),
    ('DJI Mini 4 Pro Propellers (Set)', 'Full replacement propeller set with screws for the Mini 4 Pro.', 12.00, '/images/propellers/dji-mini-4-pro-props.jpg', 320, 'dji', 'propellers-fins'),
    ('Autel EVO Lite Propellers (Set)', 'Quick-release low-noise propeller set for EVO Lite and Lite+.', 14.99, '/images/propellers/autel-evo-lite-props.jpg', 220, 'autel', 'propellers-fins'),
    ('Skydio 2+ Propeller Kit', 'Replacement propeller kit with mounting hardware for Skydio 2+.', 24.99, '/images/propellers/skydio-2-props.jpg', 140, 'skydio', 'propellers-fins'),
    ('Parrot Anafi Propeller Set', 'Complete set of folding propellers for the Parrot Anafi.', 17.99, '/images/propellers/parrot-anafi-props.jpg', 160, 'parrot', 'propellers-fins'),
    ('Holy Stone HS720G Propeller Guards', 'Set of four propeller guards plus spare props for safer beginner flying.', 13.99, '/images/propellers/holy-stone-hs720g-guards.jpg', 240, 'holy-stone', 'propellers-fins'),
    ('FPV Freedom Gemfan 5138 Props (8-Pack)', 'Durable tri-blade 5-inch propellers tuned for freestyle and racing FPV.', 9.99, '/images/propellers/fpv-freedom-gemfan-5138.jpg', 400, 'fpv-freedom', 'propellers-fins'),

    -- ===================== CONTROLLERS =====================
    ('DJI RC 2', 'Smart controller with a built-in 5.5-inch 700-nit display and O4 video transmission.', 369.00, '/images/controllers/dji-rc-2.jpg', 50, 'dji', 'controllers'),
    ('DJI RC Motion 3', 'Motion controller for intuitive one-handed FPV flying with DJI Avata 2.', 239.00, '/images/controllers/dji-rc-motion-3.jpg', 45, 'dji', 'controllers'),
    ('Autel Smart Controller V3', 'Integrated 6.4-inch OLED smart controller for the EVO II and Lite series.', 649.00, '/images/controllers/autel-smart-controller-v3.jpg', 22, 'autel', 'controllers'),
    ('Skydio Beacon', 'GPS wearable beacon enabling one-handed subject tracking and control.', 149.00, '/images/controllers/skydio-beacon.jpg', 35, 'skydio', 'controllers'),
    ('Parrot Skycontroller 4', 'Ergonomic long-range controller with smartphone mount for Anafi drones.', 199.00, '/images/controllers/parrot-skycontroller-4.jpg', 40, 'parrot', 'controllers'),
    ('Holy Stone Remote Controller', 'Replacement 2.4GHz transmitter with phone holder for HS720 series.', 44.99, '/images/controllers/holy-stone-remote.jpg', 75, 'holy-stone', 'controllers'),
    ('FPV Freedom RadioMaster TX16S', 'Full-size multiprotocol radio with hall-effect sticks and ExpressLRS support.', 199.99, '/images/controllers/fpv-freedom-tx16s.jpg', 60, 'fpv-freedom', 'controllers')
) AS v(name, description, price, image_url, stock, brand_slug, category_slug)
JOIN brands     b ON b.slug = v.brand_slug
JOIN categories c ON c.slug = v.category_slug
ON CONFLICT (name, brand_id) DO UPDATE SET image_url = EXCLUDED.image_url;
