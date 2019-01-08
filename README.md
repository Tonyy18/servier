# Servier
Node.js module for dynamic websites

Example directory

```
├── node_modules
│    └── servier
├── public
│   ├── index.html
│   └── main.js
├── index.js
└── package.json
```

Create new server instance by calling the exported module

```javascript
const servier = require("servier");
const server = servier();
```

If you want to use SSL/TLS connection, you can enter your keys in the constructor

```javascript
const servier = require("servier");
const fs = require("fs");
const options = {
  key: fs.readFileSync("my-site-key.pem"),
  cert: fs.readFileSync("chain.pem")
};
const server = servier(options);
```

<h2>start</h2>
Starts the web server on specified port

```javascript
server.start(80, () => {
    console.log("Listening on port " + server.port);
})
```

<h2>Routes</h2>
For now, servier module only has route methods for <b>GET</b> and <b>POST</b>

Any returned content will be sent as a response

```javascript
server.get("/", (req, res) => {
    let params = req.query;
    return "Hello World";
});

server.post("/", (req, res) => {
    let name = "undefined";
    if("name" in req.body) name = req.body.name;
    return "Hello " + name;
});
```

Route callback can have two parameters.    
The first parameter is the request object that includes url and body parameters.    
The second parameter is the response object that you can use to affect the http response.    
Request and response parameters are taken from http module. You can read more about what you can do with them <a href="https://nodejs.org/api/http.html">here</a>    

<h2>HTML Templates</h2>    
Instead of returning strings, you can return views from html files  

Before you can do that, you need to specify your web root    

Assign an absolute path to the `root` property    

```javascript
server.root = __dirname + "/public/";
server.get("/index", (req, res) => {
    return server.view("index.html");
});
```

<b>view</b> method takes an object as a second parameter

The object includes values for template variables

```html
<html>
    <head>
        <title>{{title}}</title>
    </head>
    <body>
        <h1>{{header}}</h1>
        <p>{{user.firstname}} {{user.lastname}}</p>
    </body>
</html>
```

```javascript
server.get("/index", (req, res) => {
    return server.view("index.html", {
        title: "Home page",
        header: "Welcome",
        user: {
            firstname: "Toni",
            lastname: "Isotalo"
        }
    });
});
```

<b>Servier</b> module uses <a href="https://handlebarsjs.com/">Handlebars</a> template module

The <b>Handlebars</b> module is fully customizable using its <a href="https://handlebarsjs.com/">documentation</a>.

<b>Handlebars</b> module is stored in `handlebars` property

```javascript
Server.prototype.handlebars = require("handlebars");
```
