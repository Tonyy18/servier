const http = require("http");
const fs = require("fs");

module.exports = servier;

function servier(options = {}) {
    return new Server(options);
}

function Server(options = {}) {

    //Private properties
    var routes = {
        "get": {},
        "post": {}
    };

    //Public
    this.running = false;
    this.root = null;
    this.http = http.createServer(options, (req, res) => {
        //Receives all http requests
        request(req, res);
    });
    this.start = (port, callback) => {
        //Starts to listen the http server
        port = parseInt(port);
        if(!port || typeof port != "number" || !Number.isInteger(port)) throw TypeError("Port is not a integer");
        if(port < 0 || port > 65535) throw RangeError("Port was out of range");
        this.http.listen(port, () => {
            this.port = port;
            call(callback);
        });
    }
    this.stop = (callback) => {
        this.http.close(() => {
            this.running = false;
            call(callback);
        });
    }

    this.get = (route, callback) => {
        //Set a route for get method
        setRoute(route, callback, "get");
    }
    this.post = (route, callback) => {
        //Set a route for post method
        setRoute(route, callback, "post");
    }
    this.view = (file, params) => {
        file = file.trim();
        if(!fs.existsSync(this.root + file)) return; //File doesn't exist
        let source = fs.readFileSync(this.root + file).toString("utf8");
        if(typeof params == "object" && Object.keys(params).length > 0) {
            //Template engine
            let template = this.handlebars.compile(source);
            source = template(params);
        }
        return source;
    }

    //Private methods
    var setRoute = (route, callback, method) => {
        //Stores routes to an object
        route = route.replace(/ /g,'')
        routes[method][route] = callback;
    }

    var request = (req, res) => {
        const method = req.method.toLowerCase();
        const url = req.url.split("?")[0];
        if(url in routes[method]) {
            //Parse query and body data
            parseData(req, (query, body) => {
                //Callback when all data is received
                req.query = query;
                req.body = body;
                res.statusCode = 200;
                res.end(routes[method][url](req, res));
            })
        } else {
            res.statusCode = 404;
            res.end("Route " + req.url + " doesn't exist");
        }
    }

    var parseData = (req, callback) => {
        //Parses url and body data and returns them as objects
        //Body data
        var bodyString = "";
        req.on("data", (chunk) => {
            var data = chunk.toString();
            bodyString += data;
        })
        req.on("end", () => {
            //Post data is ready
            //url data
            var queryString = "";
            if(req.url.indexOf("?") > -1) {
                //Removes the question mark
                queryString += req.url.substr(req.url.indexOf("?") + 1, req.url.length);
            }
            
            //Both strings to objects
            var body = paramsToObjects(bodyString);
            var query = paramsToObjects(queryString);
            callback(query, body);
        })
    }

    var paramsToObjects = (string) => {
        const obj = {};
        const params = string.split("&");
        for(let a = 0; a < params.length; a++) {
            const param = params[a];
            if(param == "") continue;
            var value = "";
            var key = param;
            if(param.indexOf("=") > -1) {
                const index = param.indexOf("=")
                key = param.substr(0, index);
                value = decodeURIComponent(param.substr(index + 1, param.length));
            } 
            obj[key] = value;
        }
        return obj
    }

    var call = (func, params = {}) => {
        //Calls the callbacks of other functions. 
        if(typeof func != "function") return;
        func(params);
    }
}

Server.prototype.handlebars = require("handlebars");
