import { unlinkSync } from "fs";
import { extname } from "path";
import * as xlsx from "xlsx";
import { UnsubscribeModel as UnsubSchema } from "./model";



export async function uploadUsersFromExcel(filePath: string) {
    try {
        if (extname(filePath) != '.xlsx') {
            unlinkSync(filePath);
            throw new Error(`please upload valid xlsx file`)
        }
        let workBook = xlsx.readFile(filePath);
        xlsx.writeFile(workBook, filePath)
        unlinkSync(filePath);
        if (!workBook.SheetNames) { throw new Error("not a valid sheet") }
        var excelEmails: any = xlsx.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]]);
        let emailIds = Array.from(new Set(excelEmails.map(email => email.emails)))
        let docs = [];
        emailIds.map(emailId => {
            docs.push({ email: emailId });
        })
        let emails = await UnsubSchema.create(docs);
        console.log(emails);
    }
    catch (err) {
        console.error(err);
    }
}

export async function createRecord(){
    let emails = await UnsubSchema.create({email:"gabriel@webileapps.com"});
    console.log(emails);
}