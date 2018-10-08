import { model, Schema } from "mongoose";
let schema = new Schema({
    email : {type: String},
    },{
    timestamps : true
});
schema.index({email: 1}, { unique: true });
var UnsubscribeModel_ = model("unsub_emails", schema);
export var UnsubscribeModel = UnsubscribeModel_;

