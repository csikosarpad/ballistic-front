CREATE TABLE rooms (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code CHAR(6) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status ENUM('waiting', 'ready', 'playing', 'finished') NOT NULL DEFAULT 'waiting',
  host_name VARCHAR(24) NOT NULL,
  guest_name VARCHAR(24) NULL,
  host_token_hash CHAR(64) CHARACTER SET ascii NOT NULL,
  guest_token_hash CHAR(64) CHARACTER SET ascii NULL,
  setup JSON NOT NULL,
  revision INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY rooms_code_unique (code),
  KEY rooms_expiration (expires_at)
) ENGINE=InnoDB;

CREATE TABLE room_events (
  room_id BIGINT UNSIGNED NOT NULL,
  revision INT UNSIGNED NOT NULL,
  player_id ENUM('P1', 'P2') NOT NULL,
  event_type VARCHAR(32) CHARACTER SET ascii NOT NULL,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, revision),
  CONSTRAINT room_events_room_fk FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
) ENGINE=InnoDB;