import psycopg2

"""
Dependencies:
psycopg2

run create_script.sql to create required tables and users in database
"""

def make_query(source=None, start=None, end=None, bounds=None):
    """
    builds up a query string
    """

    constraints = []
    if source:
        constraints.append(("source=%s", [source]))
    if start:
        constraints.append(("event_time>%s", [start]))
    if end:
        constraints.append(("event_time<%s", [end]))
    if bounds:
        ((swlat, swlng), (nelat, nelng)) = bounds
        constraints.append(("lat>%s AND lat<%s AND lng>%s AND lng<%s", [swlat, nelat, swlng, nelng]))
    
    query = "SELECT event_id, event_text, source, event_user, event_time, lat, lng, category FROM event"
    bindings = []

    is_first = True
    for constraint in constraints:
        predicate, params = constraint
   
        if is_first:
            query += " WHERE " + predicate
            is_first = False
        else:
            query += " AND " + predicate

        bindings += params

    query += ";"
    
    return query, bindings



def query(host='localhost', source=None, start=None, end=None, bounds=None):
    
    # todo: use conn_url
    # todo: use sslmode to force a secure connection
    with psycopg2.connect (
        database='eventdb',
        user='trafficread',
        password='trafficread',
        host=host,
        port=5432
    ) as conn:
        c = conn.cursor()
        
        query, params = make_query(source, start, end, bounds)

        # debug
        print ("query: " + query)

        c.execute(query, params)

        for item in c:
            event = {
                'id':item[0],
                'text':item[1],
                'source':item[2],
                'user':item[3],
                'time':item[4],
                'lat':item[5],
                'lng':item[6],
                'category':item[7]
            }
            yield event
            
        # conn.commit()

#if __name__ == "__main__":
    # run a quick demo
    #import datetime
    #q = query(start=datetime.datetime.now()-datetime.timedelta(days=10), bounds=((14,412),(-2,14.2)))
    #q = query(start=datetime.datetime.now()-datetime.timedelta(days=1))
    #print (next(q))
