import { Router } from 'express'
import { Form, WidgetTypes,FormEncoding } from "cms-forms";
import { Grid, Row } from "cms-grids";
import * as jade from "jade";
import * as path from "path";
import * as multer from "multer";
import { OK } from 'http-status-codes';
// import { createMessage, getMessages, read, update, getHtml } from './module'
import {uploadUsersFromExcel,createRecord} from "./module";
import * as bodyParser from 'body-parser';


const storage = multer.diskStorage({ //multers disk storage settings
    destination: (req, file, cb) => {
        cb(null,path.join(__dirname,'uploads'))
    },
    filename: (req, file, cb) => {
        let datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
});
const upload = multer({ //multer settings
    storage: storage
});

let router = new Router();
let relativeURL = path => path;
router.use(bodyParser.urlencoded({ extended: true}));
router.use((req, res, next) => {
    relativeURL = relativePath => req.baseUrl + relativePath;
    next();
});

router.route('/').all(async (req:any, res: any, next) => {
    let form = new Form();
    form.action = relativeURL(`/`)
    form.encType = FormEncoding.multiPartFormData;
    form.method = "POST"
    form.fields =[{
        label: 'File',
        labelClass: ['col-sm-2'],
        type: "file",
        name: 'file',
        placeholder: 'Upload File'
    },{
        labelClass: ['col-md-offset-4', 'col-md-3'],
        type: 'submit',
        value: "Upload",
        name: 'draft'
    }]
    res.form = form
    next()
}).get((req, res, next) => {
    next()
}).post((req,res,next)=>{
    try{
    upload.single('file')(req, res, () => {
        next();
    });
}catch(err){console.error(err)}
},async (req: any, res: any, next) => {
    try {
        console.log(req.file)
        await uploadUsersFromExcel(req.file.path);
        req.flash(`success`, 'Emails Uploaded Successfully');
        res.redirect('/');
    } catch (error) {
        req.flash(`danger`, error.message)
        res.form.setValues(req.body);
        next();
    }
})

export = router;