import { unlinkSync } from "fs";
import { extname } from "path";
import * as xlsx from "xlsx";
import { UnsubscribeModel as UnsubSchema } from "../upload/model";

export async function FilterRecords(filePath: string) {
    try {
        let sucessEmails=[];
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
        let emails = await UnsubSchema.find({email:{$in:emailIds}});
        let findEmailInDB=(emails,emailId)=>{return emails.find(eml=>eml.email.toLowerCase()==emailId)};
        if(emails){
            emailIds.forEach(eml => {
               let foundEmails = findEmailInDB(emails,eml.toLowerCase());
               if(!foundEmails){
                   sucessEmails.push(eml);
               }
           });        
        }
        return sucessEmails;
    }
    catch (err) {
        console.error(err);
    }
}
