import psycopg2

"""
Dependencies:
psycopg2

"""

def make_query(source=None, start=None, end=None, bounds=None):
    """
    builds up a query string
    """

    constraints = []
#    if source:
#        constraints.append(("source=%s", [source]))
    if start:
        # todo: add timestamp to SQL code
        constraints.append(("SiteRdInfo.QT_DATE = %s", [start.date()]))
        constraints.append(("SiteRdInfo.QT_TIME = %s", [start.time()]))
#    if end:
#       constraints.append(("event_time<%s", [end]))
#    if bounds:
#        ((swlat, swlng), (nelat, nelng)) = bounds
#        constraints.append(("lat>%s AND lat<%s AND lng>%s AND lng<%s", [swlat, nelat, swlng, nelng]))
    
    query = "SELECT SiteRdInfo.NB_SCATS_SITE, SiteRdInfo.QT_DATE + SiteRdInfo.QT_TIME, SiteRdInfo.avg_vo, SiteRdInfo.geom from SiteRdInfo"
    
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



def query(host='localhost', database='scats', user='trafficread', password='trafficread', port=5432,
          source=None, start=None, end=None, bounds=None):
    # todo: use conn_url
    # todo: use sslmode to force a secure connection
    with psycopg2.connect (
        database=database,
        user=user,
        password=password,
        host=host,
        port=port
    ) as conn:
        c = conn.cursor()
        
        query, params = make_query(source, start, end, bounds)

        # debug
        print ("query: " + query)

        c.execute(query, params)

        for item in c:
            event = {
                'id':item[0],
                'time':item[1],
                'intensity':item[2],
                'rd':item[3], # GeoJSON
            }
            yield event

