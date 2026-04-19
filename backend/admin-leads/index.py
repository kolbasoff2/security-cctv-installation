import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
}

def check_auth(event):
    expected = os.environ.get('ADMIN_PASSWORD', '')
    params = event.get('queryStringParameters') or {}
    token = params.get('token', '')
    return token == expected

def handler(event: dict, context) -> dict:
    """API для заявок: создание (публичное) и просмотр/управление (только для админа)."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    rid = params.get('id', '')
    body = json.loads(event.get('body') or '{}')

    # POST без action — создать заявку (публичный)
    if method == 'POST' and not action:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "INSERT INTO leads (name, phone, object, comment) VALUES (%s, %s, %s, %s) RETURNING *",
            (body.get('name', ''), body.get('phone', ''), body.get('object', ''), body.get('comment', ''))
        )
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True, 'id': row['id']}, ensure_ascii=False, default=str)}

    # Всё остальное — только для админа
    if not check_auth(event):
        return {'statusCode': 401, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Unauthorized'})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # GET или ?action=list — список заявок
    if method == 'GET' or action == 'list':
        status = params.get('status')
        if status:
            cur.execute("SELECT * FROM leads WHERE status=%s ORDER BY created_at DESC", (status,))
        else:
            cur.execute("SELECT * FROM leads ORDER BY created_at DESC")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(rows, ensure_ascii=False, default=str)}

    # POST ?action=update_status&id=1
    if action == 'update_status' and rid:
        cur.execute("UPDATE leads SET status=%s WHERE id=%s RETURNING *", (body.get('status', 'new'), rid))
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(row, ensure_ascii=False, default=str)}

    # POST ?action=delete&id=1
    if action == 'delete' and rid:
        cur.execute("DELETE FROM leads WHERE id=%s", (rid,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 404, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Not found'})}
