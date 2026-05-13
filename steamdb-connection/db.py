import mysql.connector
from config import DB_CONFIG

conn = mysql.connector.connect(**DB_CONFIG)
conn.autocommit = True
cursor = conn.cursor()

def insert_game(data):
    cursor.execute("""
        INSERT INTO games 
        (title, developer, publisher, about, steam_rating, release_date, cover_img, icon)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, data)
    return cursor.lastrowid

def insert_req(table, game_id, req):
    cursor.execute(f"""
        INSERT INTO {table} (game_id, gpu, cpu, ram, size, os, other)
        VALUES (%s,%s,%s,%s,%s,%s,%s)
    """, (
        game_id,
        req["gpu"],
        req["cpu"],
        req["ram"],
        req["size"],
        req["os"],
        req["other"]
    ))

def insert_game_tag(game_id, tag_id):
    cursor.execute("""
        INSERT IGNORE INTO game_tags (game_id, tag_id)
        VALUES (%s,%s)
    """, (game_id, tag_id))

def insert_media(game_id, sources):
    for src in sources:
        cursor.execute("""
            INSERT IGNORE INTO media (game_id, source)
            VALUES (%s, %s)
        """, (game_id, src))