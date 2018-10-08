import * as express from "express";
import { OK, INTERNAL_SERVER_ERROR } from "http-status-codes";
import * as expressSession from 'express-session';
const MongoStore = require('connect-mongo')(expressSession);
import * as bodyParser from 'body-parser';
import * as logger from 'morgan';
import * as mongoose from "mongoose";
import * as compression from "compression";
import * as path from "path";
import * as uploadRouter from "./upload/router";
import * as filterRouter from "./filter/router";
import * as jade from "jade";
import { router as cmsRouter } from "express-cms";
import { render as formRenderer } from "cms-forms";
import { render as gridRenderer } from "cms-grids";
mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/unsubscribe');
import * as flash from 'flash';


const app : express.Application = express();
app.use(expressSession({
    secret: process.env.SESSION_SECRET || 'nameste-session-secret',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    saveUninitialized: true,
    resave: false
}));
app.use(flash());
let relativeURL = path => path;
app.use(logger('dev'));
app.use((req, res, next) => { res.html = {}; next() });
app.use((req, res, next) => {
    res.locals.relativeURL=relativeURL = relativePath => req.baseUrl + relativePath;
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    res.html.layout = "admin-master.jade";
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.get('/',(req, res, next) => {
    res.html.content = jade.renderFile(path.join(__dirname, './views/admin.jade'), Object.assign(res.locals))
    next();
});
app.use('/upload',uploadRouter);
app.use('/filter',filterRouter);
app.use(formRenderer);
app.use(gridRenderer);
app.use(async (req, res, next) => {
    if (res.html && res.html.content) {
        res.render(res.html.layout || 'admin-master.jade', {
            html: res.html, title: 'CMS',description:'Jacobs'});
        delete res.html;
    } else {
        next();
    }
})

app.use((error: Error , req, res, next) => {
   res.status(error.code < 600 ? error.code : INTERNAL_SERVER_ERROR || INTERNAL_SERVER_ERROR).send({errors: [{error: error.message || error.error}]}) 
});

export = app;