"""
todo: use different backend for scalability

dependencies:
pip install flask
pip install python-dateutil
psycopg2

run create_script.sql to create required tables and users in database
"""

from flask import Flask
from flask import request
from flask import make_response

import datetime
import dateutil.parser
import dateutil.tz

import json
from flask import jsonify

import postgres_read
import postgres_read_historical
import postgres_read_road

# datetime.timezone.utc is only availiable in Python 3
timezone_utc = dateutil.tz.tzutc()

# Assume time to be UTC unless specified otherwise
default_timezone = timezone_utc

def get_date(date_string):
    d = dateutil.parser.parse(date_string)
    if d.tzinfo == None:
        d = d.replace(tzinfo=default_timezone)

    # convert to UTC
    d = d.astimezone(timezone_utc)
    
    print str(date_string) + " => " + str(d)
    
    return d

def format_date(d):
    if d.tzinfo == None:
        d = d.replace(tzinfo=default_timezone)

    # convert to UTC
    d = d.astimezone(timezone_utc)
    
    # format as ISO 8601 string
    return d.strftime('%Y-%m-%dT%H:%M:%S%z')

app = Flask(__name__)

@app.route("/")
def index():
    try:
        return make_response(open('templates/index.html').read())

    except Exception as e:
	print (e)

"""
Grabs fused sporting events/incidents
    GET /occurrence?source={twitter|facebook|all}&start={start_time}&end={end_time}&bounds={rect}

bounds follows convention used by Google maps Geocoding API:
{sw lat},{sw lng}|{nw lat},{nw lng}

Grabs traffic overlay
    GET /layer/traffic?bounds={rect}
"""

def parse_latlng(latlng, default=None):
    """
    latlng -- string
    Throws ValueError
    """
    lat, lng = latlng.split(',')
    return (float(lat), float(lng))

def parse_bounds(bounds):
    """
    bounds -- string
    Throws ValueError
    """
    if not bounds:
        return None

    sw, nw = bounds.split('|')
    return (parse_latlng(sw), parse_latlng(nw))

def parse_source(source_str):
    """
    source_str -- string
    """
    if source_str == 'all':
        # None means we don't care
        return None

    return source_str

def parse_time(time_str):
    """
    source_str -- string
    """
    if not time_str:
        return None

    return get_date(time_str)

def snap15min(datetime_orig):
    """
    rounds datetime down to the last 15 minute interval
    """
    if not datetime_orig:
        return None
    
    return datetime.datetime(datetime_orig.year, datetime_orig.month, datetime_orig.day,
                             datetime_orig.hour, (datetime_orig.minute // 15)*15, 0, 0, datetime_orig.tzinfo)

@app.route("/occurrence")
def occurance():
    try:
	source = parse_source(request.args.get('source'))
	start = parse_time(request.args.get('start'))
	end = parse_time(request.args.get('end'))
	bounds = parse_bounds(request.args.get('bounds'))

	# return str(source) + str(start) + str(end) + str(bounds)

	results = postgres_read.query(host='localhost', source=source, start=start, end=end, bounds=bounds)
	results_list = []
	for item in results:
	    item_copy = dict(item)

	    # datetime timezone cannot be easily converted to json
	    item_copy['time'] = format_date(item['time'])
	    
	    results_list.append(item_copy)

	return jsonify({'result': results_list})
    except Exception as e:
         raise
         # import traceback
         # print("ERROR: " + str(traceback.format_exc()))


def parse_historical_source(source_str):
    """
    source_str -- string
    """
    # Sanitize. Should be either 'DS' or 'VO'

    if source_str == 'DS':
        return 'DS'
    if source_str == 'VO':
        return 'VO'
    # default
    return 'VO'

"""
GET /historical?start={start_time}&end={end_time}&source={DS|VO}

{
    lat:
    lng:
    intersection_name:
    intensity:
}
"""
@app.route("/historical")
def historical():
    try:
        source = parse_historical_source(request.args.get('source'))
        start = snap15min(parse_time(request.args.get('start')))
        end = snap15min(parse_time(request.args.get('end')))
        bounds = parse_bounds(request.args.get('bounds'))

        # return str(source) + str(start) + str(end) + str(bounds)

        #results = postgres_read_historical.query(host='localhost', database='scats', source=source, start=start, end=end, bounds=bounds)
        results = postgres_read_historical.query(host='localhost', database='scats2', source=source, start=start, end=end, bounds=bounds)
# results = postgres_read_historical.query(host='example.com', database='scats', source=source, start=start, end=end, bounds=bounds)
        results_list = []
        for item in results:
            item_copy = dict(item)

            # datetime timezone cannot be easily converted to json
            item_copy['time'] = format_date(item['time'])
            
            results_list.append(item_copy)

        return jsonify({'result': results_list})
    except Exception as e:
         raise

"""
GET /road?start={start_time}&end={end_time}&source={DS|VO}

{
    lat:
    lng:
    intersection_name:
    intensity:
    geom: (as GeoJSON)
}
"""
@app.route("/road")
def road():
    try:
        source = parse_historical_source(request.args.get('source'))
        start = snap15min(parse_time(request.args.get('start')))
        end = snap15min(parse_time(request.args.get('end')))
        bounds = parse_bounds(request.args.get('bounds'))

        #results = postgres_read_road.query(host='localhost', database='scats', source=source, start=start, end=end, bounds=bounds)
        #results = postgres_read_road.query(host='localhost', database='scats2', source=source, start=start, end=end, bounds=bounds)
        results = postgres_read_road.query(host='localhost', database='scats', source=source, start=start, end=end, bounds=bounds)
        
        print("road results fetched")
        
        results_list = []
        for item in results:
            item_copy = dict(item)

            # datetime timezone cannot be easily converted to json
            item_copy['time'] = format_date(item['time'])
            
            # postgres should output valid GeoJSON string for road
            if item['rd']:
                item_copy['rd'] = json.loads(item['rd'])
            
            # Decimal type cannot be easily converted to json
            item_copy['intensity'] = float(item['intensity'])
            
            results_list.append(item_copy)

        print("jsonifying road results")
        
        return jsonify({'result': results_list})
    except Exception as e:
         raise

if __name__ == "__main__":
    #app.run()

    # make publicly visible on all public ips (for production)
    # app.run(host=0.0.0.0)

    # allows arbitrary code execution!
    app.run(debug=True)
