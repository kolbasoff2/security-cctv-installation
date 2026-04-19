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
    """API для управления контентом сайта. Маршрутизация через ?action=... параметр."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    rid = params.get('id', '')
    body = json.loads(event.get('body') or '{}')

    print(f"REQUEST: method={method} action={repr(action)} id={repr(rid)}")

    # GET (без action) — публичные данные для сайта
    if method == 'GET' and not action:
        conn = get_conn()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT key, value FROM site_settings")
        settings = {r['key']: r['value'] for r in cur.fetchall()}
        cur.execute("SELECT * FROM services WHERE is_active=TRUE ORDER BY sort_order")
        services = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM portfolio WHERE is_active=TRUE ORDER BY sort_order")
        portfolio = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM calc_camera_types WHERE is_active=TRUE ORDER BY sort_order")
        camera_types = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM calc_object_types WHERE is_active=TRUE ORDER BY sort_order")
        object_types = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM calc_archive_options WHERE is_active=TRUE ORDER BY sort_order")
        archive_options = [dict(r) for r in cur.fetchall()]
        cur.execute("SELECT * FROM company_stats ORDER BY sort_order")
        stats = [dict(r) for r in cur.fetchall()]
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'settings': settings, 'services': services, 'portfolio': portfolio,
                'camera_types': camera_types, 'object_types': object_types,
                'archive_options': archive_options, 'stats': stats,
            }, ensure_ascii=False, default=str)
        }

    # Все мутации требуют авторизации
    if not check_auth(event):
        return {'statusCode': 401, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': 'Unauthorized'})}

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # POST ?action=save_settings
    if action == 'save_settings':
        for key, value in body.items():
            cur.execute(
                "INSERT INTO site_settings (key, value, updated_at) VALUES (%s, %s, NOW()) ON CONFLICT (key) DO UPDATE SET value=%s, updated_at=NOW()",
                (key, value, value)
            )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    # POST ?action=save_service&id=1
    if action == 'save_service' and rid:
        cur.execute(
            "UPDATE services SET icon=%s, title=%s, description=%s, sort_order=%s, is_active=%s, updated_at=NOW() WHERE id=%s RETURNING *",
            (body.get('icon'), body.get('title'), body.get('description'), body.get('sort_order'), body.get('is_active', True), rid)
        )
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(row, ensure_ascii=False, default=str)}

    # POST ?action=add_service
    if action == 'add_service':
        cur.execute(
            "INSERT INTO services (icon, title, description, sort_order) VALUES (%s, %s, %s, %s) RETURNING *",
            (body.get('icon', 'Star'), body['title'], body['description'], body.get('sort_order', 99))
        )
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(row, ensure_ascii=False, default=str)}

    # POST ?action=delete_service&id=1
    if action == 'delete_service' and rid:
        cur.execute("DELETE FROM services WHERE id=%s", (rid,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    # POST ?action=save_portfolio&id=1
    if action == 'save_portfolio' and rid:
        cur.execute(
            "UPDATE portfolio SET title=%s, description=%s, type=%s, gradient=%s, sort_order=%s, is_active=%s, updated_at=NOW() WHERE id=%s RETURNING *",
            (body.get('title'), body.get('description'), body.get('type'), body.get('gradient'), body.get('sort_order'), body.get('is_active', True), rid)
        )
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(row, ensure_ascii=False, default=str)}

    # POST ?action=add_portfolio
    if action == 'add_portfolio':
        cur.execute(
            "INSERT INTO portfolio (title, description, type, gradient, sort_order) VALUES (%s, %s, %s, %s, %s) RETURNING *",
            (body['title'], body['description'], body.get('type', ''), body.get('gradient', 'from-cyan-900/40 to-blue-900/40'), body.get('sort_order', 99))
        )
        row = dict(cur.fetchone())
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps(row, ensure_ascii=False, default=str)}

    # POST ?action=delete_portfolio&id=1
    if action == 'delete_portfolio' and rid:
        cur.execute("DELETE FROM portfolio WHERE id=%s", (rid,))
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    # POST ?action=save_camera&id=1
    if action == 'save_camera' and rid:
        cur.execute(
            "UPDATE calc_camera_types SET label=%s, price=%s, sort_order=%s, is_active=%s WHERE id=%s",
            (body.get('label'), body.get('price'), body.get('sort_order'), body.get('is_active', True), rid)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    # POST ?action=save_object&id=1
    if action == 'save_object' and rid:
        cur.execute(
            "UPDATE calc_object_types SET label=%s, mult=%s, sort_order=%s, is_active=%s WHERE id=%s",
            (body.get('label'), body.get('mult'), body.get('sort_order'), body.get('is_active', True), rid)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    # POST ?action=save_archive&id=1
    if action == 'save_archive' and rid:
        cur.execute(
            "UPDATE calc_archive_options SET label=%s, price=%s, sort_order=%s, is_active=%s WHERE id=%s",
            (body.get('label'), body.get('price'), body.get('sort_order'), body.get('is_active', True), rid)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    # POST ?action=save_stat&id=1
    if action == 'save_stat' and rid:
        cur.execute(
            "UPDATE company_stats SET value=%s, label=%s, sort_order=%s WHERE id=%s",
            (body.get('value'), body.get('label'), body.get('sort_order'), rid)
        )
        conn.commit()
        conn.close()
        return {'statusCode': 200, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'ok': True})}

    conn.close()
    return {'statusCode': 404, 'headers': {**CORS_HEADERS, 'Content-Type': 'application/json'}, 'body': json.dumps({'error': f'Unknown action: {action}'})}
