import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 'public')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], options=f'-c search_path={SCHEMA}')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
}

def check_auth(event):
    token = event.get('headers', {}).get('X-Admin-Token', '')
    return token == os.environ.get('ADMIN_PASSWORD', '')

def handler(event: dict, context) -> dict:
    """API для заявок: создание (публичное) и просмотр/управление (только для админа)."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = json.loads(event.get('body') or '{}')

    # POST / — создать заявку (публичный)
    if method == 'POST' and path == '/':
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "INSERT INTO leads (name, phone, object, comment) VALUES (%s, %s, %s, %s) RETURNING *",
            (body.get('name', ''), body.get('phone', ''), body.get('object', ''), body.get('comment', ''))
        )
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True, 'id': row['id']}, ensure_ascii=False, default=str)
        }

    # Всё остальное — только для админа
    if not check_auth(event):
        return {
            'statusCode': 401,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Unauthorized'})
        }

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # GET / — список заявок
    if method == 'GET' and path == '/':
        status_filter = event.get('queryStringParameters', {}) or {}
        status = status_filter.get('status')
        if status:
            cur.execute("SELECT * FROM leads WHERE status=%s ORDER BY created_at DESC", (status,))
        else:
            cur.execute("SELECT * FROM leads ORDER BY created_at DESC")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps(rows, ensure_ascii=False, default=str)
        }

    # PUT /{id} — обновить статус заявки
    if method == 'PUT' and len(path.split('/')) == 2:
        lid = path.split('/')[-1]
        new_status = body.get('status', 'new')
        cur.execute("UPDATE leads SET status=%s WHERE id=%s RETURNING *", (new_status, lid))
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps(row, ensure_ascii=False, default=str)
        }

    # DELETE /{id}
    if method == 'DELETE' and len(path.split('/')) == 2:
        lid = path.split('/')[-1]
        cur.execute("DELETE FROM leads WHERE id=%s", (lid,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 404, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Not found'})}
